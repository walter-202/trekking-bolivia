import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Trash2,
  Map,
  Database,
  AlertTriangle,
  CheckCircle2,
  X,
  Compass,
  Info,
  Layers,
  StopCircle,
} from 'lucide-react';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { TileCacheDB, OfflineRegion } from '../../../infrastructure/persistence/tileCacheDB';
import {
  calculateTilesInBounds,
  downloadTiles,
  TileCoordinate,
} from '../../../infrastructure/persistence/tileDownloader';
import { TrekkingMap } from './TrekkingMap';
import { Button } from '../ui/Button';

export const OfflineMapManager: React.FC = () => {
  const {
    isOfflineMode,
    offlineRegions,
    isDownloadingRegion,
    downloadProgress,
    fetchOfflineRegions,
    addOfflineRegion,
    deleteOfflineRegion,
    setDownloadingState,
  } = useTrekkingStore();

  // Selection states
  const [isSelecting, setIsSelecting] = useState(false);
  const [regionName, setRegionName] = useState('');
  const [minZoom, setMinZoom] = useState<number>(12);
  const [maxZoom, setMaxZoom] = useState<number>(14);
  const [provider, setProvider] = useState<'topo' | 'streets' | 'sat' | 'opentopo'>('topo');
  const [bounds, setBounds] = useState({
    minLat: -16.55,
    minLng: -67.92,
    maxLat: -16.51,
    maxLng: -67.86,
  });

  // Database stats
  const [cacheStats, setCacheStats] = useState({ sizeMB: 0, tileCount: 0 });
  const [tilesToDownload, setTilesToDownload] = useState<TileCoordinate[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Abort controller for cancelling downloads
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load regions and database size on mount
  useEffect(() => {
    fetchOfflineRegions();
    updateCacheStats();
  }, []);

  // Update calculated tiles list in real-time when bounds, zoom, or provider changes
  useEffect(() => {
    const list = calculateTilesInBounds(bounds, minZoom, maxZoom, provider);
    setTilesToDownload(list);
  }, [bounds, minZoom, maxZoom, provider]);

  const updateCacheStats = async () => {
    const stats = await TileCacheDB.calculateTotalCacheSize();
    setCacheStats(stats);
  };

  const handleBoundsChange = (newBounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  }) => {
    setBounds(newBounds);
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setDownloadingState(false, { downloaded: 0, total: 0, progressPercent: 0, sizeBytes: 0 });
    }
  };

  const handleStartDownload = async () => {
    if (!regionName.trim()) {
      setErrorMsg('Debes ingresar un nombre para la región offline.');
      return;
    }
    if (tilesToDownload.length === 0) {
      setErrorMsg('No hay tiles seleccionados para descargar.');
      return;
    }
    if (tilesToDownload.length > 500) {
      setErrorMsg('El sector es demasiado grande. Limita el rango de zoom o el área para descargar menos de 500 tiles.');
      return;
    }

    setErrorMsg(null);
    setDownloadingState(true, {
      downloaded: 0,
      total: tilesToDownload.length,
      progressPercent: 0,
      sizeBytes: 0,
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const newRegion: OfflineRegion = {
      id: `region-${Date.now()}`,
      name: regionName.trim(),
      minLat: bounds.minLat,
      minLng: bounds.minLng,
      maxLat: bounds.maxLat,
      maxLng: bounds.maxLng,
      minZoom,
      maxZoom,
      tileCount: tilesToDownload.length,
      downloadedCount: 0,
      status: 'downloading',
      createdAt: Date.now(),
      sizeBytes: 0,
    };

    // Save region as downloading in store
    addOfflineRegion(newRegion);

    try {
      const results = await downloadTiles(
        tilesToDownload,
        (downloaded, total, bytes) => {
          const percent = Math.round((downloaded / total) * 100);
          setDownloadingState(true, {
            downloaded,
            total,
            progressPercent: percent,
            sizeBytes: bytes,
          });
        },
        abortController.signal
      );

      const finalStatus = results.failedCount === 0 ? 'completed' : 'failed';

      // Update region metadata with final statistics
      const updatedRegion: OfflineRegion = {
        ...newRegion,
        downloadedCount: results.downloadedCount,
        status: finalStatus,
        sizeBytes: results.sizeBytes,
      };

      addOfflineRegion(updatedRegion);
      setRegionName('');
      setIsSelecting(false);
    } catch (e: any) {
      console.error('Error durante la descarga de tiles:', e);
      const failedRegion: OfflineRegion = {
        ...newRegion,
        status: 'failed',
      };
      addOfflineRegion(failedRegion);
    } finally {
      setDownloadingState(false, { downloaded: 0, total: 0, progressPercent: 0, sizeBytes: 0 });
      abortControllerRef.current = null;
      updateCacheStats();
    }
  };

  const handleDeleteRegion = async (region: OfflineRegion) => {
    // Generate key list for this region's tiles to delete them across free providers
    const providers: ('topo' | 'streets' | 'sat' | 'opentopo')[] = ['topo', 'streets', 'sat', 'opentopo'];
    const keysToDelete: string[] = [];

    for (const prov of providers) {
      const tiles = calculateTilesInBounds(
        {
          minLat: region.minLat,
          minLng: region.minLng,
          maxLat: region.maxLat,
          maxLng: region.maxLng,
        },
        region.minZoom,
        region.maxZoom,
        prov
      );
      keysToDelete.push(...tiles.map((t) => t.key));
    }

    // Delete tiles and the metadata
    await TileCacheDB.deleteTilesForRegionKeys(keysToDelete);
    await deleteOfflineRegion(region.id);
    updateCacheStats();
  };

  const handleClearAllCache = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar TODA la caché de mapas de IndexedDB? Perderás todos los mapas descargados.')) {
      await TileCacheDB.clearAllTiles();
      await fetchOfflineRegions();
      updateCacheStats();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 MB';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-800" />
          <h3 className="font-bold text-stone-800 text-sm">Descarga de Mapas Offline</h3>
        </div>
        <div className="text-[11px] text-stone-500 font-medium bg-stone-100 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-stone-200/80">
          <Database className="w-3.5 h-3.5 text-stone-500" />
          Caché: <span className="font-bold text-stone-800">{cacheStats.sizeMB} MB</span> ({cacheStats.tileCount} tiles)
        </div>
      </div>

      {/* Progress display if downloading */}
      {isDownloadingRegion && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-xs space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Descargando Sector en IndexedDB...</span>
            </div>
            <button
              onClick={handleCancelDownload}
              className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
          
          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden border border-stone-300">
            <div
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
            <span>
              Tiles: <span className="font-bold text-stone-800">{downloadProgress.downloaded}</span> / {downloadProgress.total}
            </span>
            <span>
              Descargado: <span className="font-bold text-stone-800">{formatSize(downloadProgress.sizeBytes)}</span>
            </span>
            <span className="font-bold text-emerald-800">{downloadProgress.progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Selector view */}
      {isSelecting ? (
        <div className="space-y-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs shadow-inner">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-800">Definir Nuevo Sector Offline</h4>
            <button
              onClick={() => setIsSelecting(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Nombre del Sector (Ej: Tuni Condoriri, Valle Ánimas)
              </label>
              <input
                type="text"
                placeholder="Ingresar nombre del sector..."
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Map Area */}
            <div>
              <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                1. Ajusta la zona moviendo y acercando el mapa:
              </span>
              <TrekkingMap
                center={[-16.5385, -67.8924]}
                zoom={12}
                isSelectingRegion={true}
                onSelectionBoundsChange={handleBoundsChange}
                className="h-44 w-full"
              />
              <p className="text-[10px] text-stone-500 mt-1 italic text-center">
                El recuadro verde punteado representa la zona exacta de descarga.
              </p>
            </div>

            {/* Range and Provider */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  2. Proveedor de Mapas
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none"
                >
                  <option value="topo">Topográfico Montaña (Esri)</option>
                  <option value="streets">Senderos y Accesos (Esri)</option>
                  <option value="sat">Satélite Natural (Esri)</option>
                  <option value="opentopo">Curvas de Nivel (OpenTopo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  3. Zoom Máximo (Detalle)
                </label>
                <select
                  value={maxZoom}
                  onChange={(e) => setMaxZoom(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none"
                >
                  <option value={13}>Zoom 13 (Vista general)</option>
                  <option value={14}>Zoom 14 (Suficiente montaña)</option>
                  <option value={15}>Zoom 15 (Alto detalle)</option>
                </select>
              </div>
            </div>

            {/* Calculations and Summary */}
            <div className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50 flex items-start gap-2 text-stone-700">
              <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-950">Resumen del Sector Calculado:</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Límites de descarga: <span className="font-mono">Lat [{bounds.minLat.toFixed(3)} a {bounds.maxLat.toFixed(3)}]</span>, <span className="font-mono">Lng [{bounds.minLng.toFixed(3)} a {bounds.maxLng.toFixed(3)}]</span>.
                </p>
                <p className="text-[11px] mt-1">
                  Total de tiles a procesar: <span className="font-bold text-stone-800">{tilesToDownload.length}</span> (Aprox.{' '}
                  <span className="font-bold text-stone-800">{(tilesToDownload.length * 0.02).toFixed(2)} MB</span> en IndexedDB)
                </p>
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="font-medium text-[11px]">{errorMsg}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 py-1.5 text-xs bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                onClick={() => setIsSelecting(false)}
                disabled={isDownloadingRegion}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="flex-1 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1.5"
                onClick={handleStartDownload}
                disabled={isDownloadingRegion || tilesToDownload.length === 0}
              >
                <Download className="w-3.5 h-3.5" /> Descargar Tiles
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="w-full text-xs bg-white border-stone-300 text-stone-700 font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-all cursor-pointer"
            onClick={() => setIsSelecting(true)}
            disabled={isDownloadingRegion}
          >
            <Layers className="w-4 h-4" /> Definir Nueva Zona de Navegación Offline
          </Button>
        </div>
      )}

      {/* List of Offline Regions */}
      <div className="space-y-2">
        <h4 className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
          Tus Zonas Guardadas ({offlineRegions.length})
        </h4>

        {offlineRegions.length === 0 ? (
          <div className="p-4 rounded-xl border border-stone-200 bg-white/50 text-center text-stone-400 text-xs">
            No tienes zonas de mapa descargadas aún. Usa el botón superior para definir tu primer sector para trekings offline.
          </div>
        ) : (
          <div className="space-y-2">
            {offlineRegions.map((region) => (
              <div
                key={region.id}
                className="p-3 rounded-xl border border-stone-200 bg-white shadow-xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 leading-tight">{region.name}</span>
                    {region.status === 'completed' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" /> Listo
                      </span>
                    ) : region.status === 'downloading' ? (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                        Descargando...
                      </span>
                    ) : (
                      <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        Incompleto
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Zoom: {region.minZoom} - {region.maxZoom} • {region.tileCount} tiles • {formatSize(region.sizeBytes)}
                  </p>
                  <p className="text-[9px] text-stone-400 font-mono">
                    Límites: [{region.minLat.toFixed(3)}, {region.minLng.toFixed(3)}] a [{region.maxLat.toFixed(3)}, {region.maxLng.toFixed(3)}]
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title="Borrar mapa de IndexedDB"
                    className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 cursor-pointer transition-colors"
                    onClick={() => handleDeleteRegion(region)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wipe Cache Footer */}
      {cacheStats.tileCount > 0 && (
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Liberar almacenamiento en dispositivo:</span>
          <button
            onClick={handleClearAllCache}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Vaciar Todo ({cacheStats.sizeMB} MB)
          </button>
        </div>
      )}
    </div>
  );
};
