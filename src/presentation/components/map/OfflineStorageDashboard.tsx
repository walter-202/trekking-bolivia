import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Database,
  Layers,
  PieChart,
  Trash2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { TileCacheDB } from '../../../infrastructure/persistence/tileCacheDB';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';

interface StorageStats {
  totalSizeMB: number;
  totalCount: number;
  byProvider: {
    osmSizeMB: number;
    osmCount: number;
    topoSizeMB: number;
    topoCount: number;
  };
  byZoom: { zoom: number; sizeMB: number; count: number }[];
}

interface OfflineStorageDashboardProps {
  onGoToDownload?: () => void;
}

export const OfflineStorageDashboard: React.FC<OfflineStorageDashboardProps> = ({ onGoToDownload }) => {
  const { offlineRegions, fetchOfflineRegions } = useTrekkingStore();
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'zoom'>('overview');

  const loadStats = async () => {
    setLoading(true);
    try {
      const detailedStats = await TileCacheDB.calculateDetailedStorageStats();
      setStats(detailedStats);
      await fetchOfflineRegions();
    } catch (e) {
      console.error('Error al cargar estadísticas detalladas:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllCache = async () => {
    if (window.confirm('¿Deseas vaciar todos los tiles de mapas de IndexedDB?')) {
      await TileCacheDB.clearAllTiles();
      await loadStats();
    }
  };

  useEffect(() => {
    loadStats();
  }, [offlineRegions.length]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 MB';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Cache limit configuration for comparison
  const SUGGESTED_MAX_CACHE_MB = 500;
  const currentSizeMB = stats?.totalSizeMB || 0;
  const usagePercentage = Math.min(
    100,
    Math.round((currentSizeMB / SUGGESTED_MAX_CACHE_MB) * 100)
  );

  // Get cache health state
  const getCacheHealth = () => {
    if (currentSizeMB === 0) return { label: 'Vacio', color: 'text-stone-400 bg-stone-100 border-stone-200', desc: 'No hay mapas descargados.' };
    if (currentSizeMB < 50) return { label: 'Excelente', color: 'text-emerald-800 bg-emerald-50 border-emerald-200', desc: 'Uso mínimo del espacio del dispositivo.' };
    if (currentSizeMB < 200) return { label: 'Optimizado', color: 'text-blue-800 bg-blue-50 border-blue-200', desc: 'Balance saludable para trekking.' };
    if (currentSizeMB < 400) return { label: 'Moderado', color: 'text-amber-800 bg-amber-50 border-amber-200', desc: 'Consumo intermedio. Monitorea zonas en desuso.' };
    return { label: 'Elevado', color: 'text-rose-800 bg-rose-50 border-rose-200', desc: 'Consumo considerable. Considera borrar mapas antiguos.' };
  };

  const health = getCacheHealth();

  return (
    <div className="space-y-4">
      {/* Header with refresh action */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-800" />
          <div>
            <h3 className="font-bold text-stone-800 text-sm">Dashboard de Almacenamiento</h3>
            <p className="text-[10px] text-stone-400">Estado de la caché local de IndexedDB</p>
          </div>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-500 transition-colors cursor-pointer disabled:opacity-50"
          title="Actualizar análisis de almacenamiento"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin" />
          <span className="text-[11px] text-stone-400 font-medium">Analizando almacenamiento...</span>
        </div>
      ) : stats ? (
        <div className="space-y-4">
          {/* Main Visual Progress / Meter */}
          <div className="p-3.5 rounded-xl border border-stone-150 bg-stone-50/50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Espacio Consumido</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-stone-800 font-mono">{stats.totalSizeMB}</span>
                  <span className="text-xs font-bold text-stone-500">MB</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {stats.totalCount.toLocaleString()} archivos de mapas (tiles) locales
                </span>
              </div>

              {/* Health Badge */}
              <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold text-right flex flex-col ${health.color}`}>
                <span className="text-[9px] uppercase tracking-wide opacity-80">Salud de Caché</span>
                <span>{health.label}</span>
              </div>
            </div>

            {/* Custom Horizontal Meter compared to 500MB suggested max */}
            <div className="space-y-1">
              <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden border border-stone-300 flex">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-l-full"
                  style={{ width: `${stats.byProvider.osmSizeMB > 0 ? (stats.byProvider.osmSizeMB / SUGGESTED_MAX_CACHE_MB) * 100 : 0}%` }}
                  title={`Mapas Callajeros: ${stats.byProvider.osmSizeMB} MB`}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${stats.byProvider.topoSizeMB > 0 ? (stats.byProvider.topoSizeMB / SUGGESTED_MAX_CACHE_MB) * 100 : 0}%` }}
                  title={`Mapas Topográficos: ${stats.byProvider.topoSizeMB} MB`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>0 MB</span>
                <span>Uso actual: {usagePercentage}% de {SUGGESTED_MAX_CACHE_MB} MB sugeridos</span>
                <span>500 MB</span>
              </div>
            </div>

            <p className="text-[10px] text-stone-500 italic flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {health.desc}
            </p>
          </div>

          {/* Navigation Tabs inside dashboard */}
          <div className="flex border-b border-stone-200 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-1.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('regions')}
              className={`pb-1.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'regions'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Zonas Guardadas ({offlineRegions.length})
            </button>
            <button
              onClick={() => setActiveTab('zoom')}
              className={`pb-1.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'zoom'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Detalle por Zoom
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              {/* Provider Comparative Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                {/* Street maps card */}
                <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      Callejero (OSM)
                    </span>
                    <Layers className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black text-stone-800 font-mono">{stats.byProvider.osmSizeMB}</span>
                      <span className="text-[10px] font-bold text-stone-500">MB</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {stats.byProvider.osmCount.toLocaleString()} tiles cargados
                    </span>
                  </div>
                </div>

                {/* Topographic maps card */}
                <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Topo (OpenTopo)
                    </span>
                    <TrendingUp className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black text-stone-800 font-mono">{stats.byProvider.topoSizeMB}</span>
                      <span className="text-[10px] font-bold text-stone-500">MB</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {stats.byProvider.topoCount.toLocaleString()} tiles cargados
                    </span>
                  </div>
                </div>
              </div>

              {/* Cache storage breakdown summary */}
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4.5 h-4.5 text-emerald-800 shrink-0 mt-0.5" />
                <div className="space-y-1 text-emerald-950">
                  <p className="font-bold">¿Cómo optimizar mi espacio?</p>
                  <p className="text-[10px] leading-relaxed text-emerald-800">
                    Los mapas descargados se almacenan de forma segura en la base de datos de tu navegador (IndexedDB) para su uso en la montaña sin cobertura. Para liberar espacio de forma segura, puedes eliminar sectores específicos que no vayas a visitar pronto.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGIONS SPACE COST */}
          {activeTab === 'regions' && (
            <div className="space-y-2">
              {offlineRegions.length === 0 ? (
                <div className="p-4 text-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                  No tienes sectores descargados para desglosar.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {offlineRegions.map((region) => {
                    const regionSizeMB = Number((region.sizeBytes / (1024 * 1024)).toFixed(2));
                    const percentage = Math.max(1, Math.min(100, Math.round((regionSizeMB / (stats.totalSizeMB || 1)) * 100)));
                    
                    return (
                      <div key={region.id} className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-stone-800">
                          <span className="truncate max-w-[170px]">{region.name}</span>
                          <span className="font-mono">{regionSizeMB} MB</span>
                        </div>
                        {/* Progress bar representing share of cache */}
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-stone-400 font-medium">
                          <span>{region.tileCount} tiles totales</span>
                          <span>{percentage}% de la caché</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ZOOM DETAILS */}
          {activeTab === 'zoom' && (
            <div className="space-y-3">
              <p className="text-[10px] text-stone-500 italic">
                Nota: Los niveles de zoom altos (14 y 15) contienen mucho más detalle y consumen exponencialmente más tiles y espacio que los niveles generales (11-13).
              </p>

              {stats.byZoom.length === 0 ? (
                <div className="p-4 text-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                  No hay datos por nivel de zoom todavía.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.byZoom.map((item) => {
                    // Find max size to calculate percentage for visual scaling
                    const maxSize = Math.max(...stats.byZoom.map(z => z.sizeMB), 0.1);
                    const percent = Math.round((item.sizeMB / maxSize) * 100);

                    return (
                      <div key={item.zoom} className="flex items-center gap-3 text-xs">
                        <span className="w-16 font-bold text-stone-700 shrink-0">Zoom {item.zoom}</span>
                        
                        <div className="flex-1 bg-stone-100 h-5 rounded-md overflow-hidden relative flex items-center px-2">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-emerald-100/70 border-r border-emerald-200/80 transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                          <span className="relative z-10 font-bold text-stone-800 font-mono text-[10px]">
                            {item.sizeMB} MB <span className="font-normal text-stone-500">({item.count} tiles)</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* Empty state shortcut */}
          {stats.totalCount === 0 && onGoToDownload && (
            <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center text-xs space-y-1.5">
              <p className="text-stone-500">Aún no has descargado mapas para uso sin conexión.</p>
              <button
                onClick={onGoToDownload}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                Descargar primer sector offline
              </button>
            </div>
          )}

          {/* Wipe Cache Footer */}
          {stats.totalCount > 0 && (
            <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>Espacio ocupado: <strong className="text-stone-700">{stats.totalSizeMB} MB</strong> ({stats.totalCount} tiles)</span>
              <button
                onClick={handleClearAllCache}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vaciar Caché de Mapas
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-center text-stone-400 text-xs">
          Ocurrió un error al cargar los datos del almacenamiento.
        </div>
      )}
    </div>
  );
};
