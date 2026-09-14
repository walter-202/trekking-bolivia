import React, { useState, useMemo } from 'react';
import { Share } from 'react-native';
import {
  Search,
  Filter,
  Download,
  Share2,
  MapPin,
  Clock,
  Navigation,
  Compass,
  CheckCircle2,
  Play,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { RouteModel, RouteDifficulty } from '../../../core/domain/types';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { TrekkingMap } from '../../components/map/TrekkingMap';
import {
  formatDuration,
  calculateOfflineSizeMB,
  calculateElevationGainM,
} from '../../../core/domain/calculations';

interface ExploreViewProps {
  onSelectRouteForActivity: (route: RouteModel) => void;
  onOpenAuth?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectRouteForActivity,
  onOpenAuth,
}) => {
  const { routes, offlineRouteIds, downloadRouteOffline, removeOfflineRoute } = useTrekkingStore();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<RouteDifficulty | 'todas'>('todas');
  const [selectedRoute, setSelectedRoute] = useState<RouteModel | null>(null);

  // Filter only published and public routes for catalog (RF-05, RF-06)
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (r.status !== 'published') return false;

      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.region.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === 'todas' || r.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [routes, searchQuery, selectedDifficulty]);

  const handleCardClick = (route: RouteModel) => {
    if (!currentUser && onOpenAuth) {
      onOpenAuth();
      return;
    }
    setSelectedRoute(route);
  };

  // HU-05: Native Share using React Native / Expo OS Share Sheet
  const handleNativeShare = async (route: RouteModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const shareMessage =
        `🏔️ *${route.title}* — Trekking Bolivia Pro\n\n` +
        `📍 Región: ${route.region}\n` +
        `📏 Distancia: ${route.distanceKm} km · Desnivel: +${route.elevationGainM ?? calculateElevationGainM(route.waypoints)}m\n` +
        `⏱️ Duración estimada: ${formatDuration(route.durationMinutes)}\n` +
        `🧗 Dificultad: ${route.difficulty.toUpperCase()} · Modalidad: ${route.modality.toUpperCase()}\n\n` +
        `🗺️ Explora el mapa topográfico y coordenadas GPS aquí:\nhttps://trekbolivia.bo/r/${route.id}`;

      await Share.share(
        {
          title: route.title,
          message: shareMessage,
          url: `https://trekbolivia.bo/r/${route.id}`,
        },
        {
          dialogTitle: `Compartir travesía: ${route.title}`,
        }
      );
    } catch (error) {
      console.warn('Error al compartir con Expo / React Native Share:', error);
    }
  };

  // Screen 2: Dedicated Route Detail Screen (Replaces previous modal)
  if (selectedRoute) {
    const isCached = offlineRouteIds.includes(selectedRoute.id);
    const offlineMB =
      selectedRoute.estimatedOfflineSizeMB ||
      calculateOfflineSizeMB(selectedRoute.waypoints.length, selectedRoute.checkpoints.length);

    return (
      <div className="space-y-4 pb-8 animate-in fade-in">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200 shadow-xs sticky top-0 z-20">
          <button
            onClick={() => setSelectedRoute(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </button>
          <button
            onClick={() => handleNativeShare(selectedRoute)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
        </div>

        {/* Route Header Banner */}
        <div className="bg-[#051712] text-white p-5 rounded-2xl border border-[#12382c] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
              {selectedRoute.region}
            </span>
            <Badge difficulty={selectedRoute.difficulty} className="text-[10px] capitalize">
              {selectedRoute.difficulty}
            </Badge>
          </div>
          <h1 className="text-xl font-black text-white leading-tight">
            {selectedRoute.title}
          </h1>
          <p className="text-xs text-stone-300 leading-relaxed">
            {selectedRoute.description}
          </p>
        </div>

        {/* Interactive Topographic Map (RF-09) */}
        <Card className="p-3 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 px-1">
            <span>Trazado Oficial & Relieve Cartográfico</span>
            <span className="text-[10px] text-stone-400 font-mono">
              {selectedRoute.waypoints.length} puntos GPS
            </span>
          </div>
          <TrekkingMap
            waypoints={selectedRoute.waypoints}
            checkpoints={selectedRoute.checkpoints}
            startPoint={selectedRoute.startPoint}
            endPoint={selectedRoute.endPoint}
            className="h-64 w-full rounded-xl"
          />
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 bg-white p-3.5 rounded-2xl border border-stone-200 text-center shadow-xs">
          <div>
            <span className="text-[10px] text-stone-400 block font-medium uppercase">
              Distancia
            </span>
            <span className="text-sm font-black text-stone-800">
              {selectedRoute.distanceKm} km
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-medium uppercase">
              Tiempo
            </span>
            <span className="text-sm font-black text-stone-800">
              {formatDuration(selectedRoute.durationMinutes)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-medium uppercase">
              Desnivel
            </span>
            <span className="text-xs font-bold text-emerald-700">
              +{selectedRoute.elevationGainM ?? calculateElevationGainM(selectedRoute.waypoints)}m
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-medium uppercase">
              Modalidad
            </span>
            <span className="text-xs font-bold capitalize text-blue-700">
              {selectedRoute.modality}
            </span>
          </div>
        </div>

        {/* Start & Destination */}
        <div className="space-y-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-900 uppercase font-bold">
                Punto de Inicio Oficial:
              </span>
              <p className="text-stone-800 font-semibold mt-0.5">
                {selectedRoute.startPoint.name} ({selectedRoute.startPoint.lat.toFixed(4)},{' '}
                {selectedRoute.startPoint.lng.toFixed(4)})
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 pt-2 border-t border-emerald-200/50">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] text-rose-900 uppercase font-bold">
                Destino Final:
              </span>
              <p className="text-stone-800 font-semibold mt-0.5">
                {selectedRoute.endPoint.name} ({selectedRoute.endPoint.lat.toFixed(4)},{' '}
                {selectedRoute.endPoint.lng.toFixed(4)})
              </p>
            </div>
          </div>
        </div>

        {/* Checkpoints & Landmarks */}
        <Card className="p-4 bg-white space-y-3">
          <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider flex items-center justify-between">
            <span>Puntos de Interés y Campamentos</span>
            <span className="text-stone-400 font-normal">
              {selectedRoute.checkpoints.length} registrados
            </span>
          </h4>
          <div className="space-y-2 text-xs">
            {selectedRoute.checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 flex items-start gap-3"
              >
                <span className="text-lg">
                  {cp.category === 'agua' && '💧'}
                  {cp.category === 'camping' && '⛺'}
                  {cp.category === 'peligro' && '⚠️'}
                  {cp.category === 'vista' && '📷'}
                  {cp.category === 'refugio' && '🏠'}
                  {cp.category === 'descanso' && '🛑'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-stone-900">{cp.name}</p>
                    <span className="text-[10px] uppercase text-stone-400 font-bold">
                      {cp.category}
                    </span>
                  </div>
                  {cp.notes && <p className="text-stone-500 mt-0.5 leading-relaxed">{cp.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Controls */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            {isCached ? (
              <Button
                variant="outline"
                className="flex-1 text-xs border-emerald-400 text-emerald-700 bg-emerald-50"
                onClick={() => removeOfflineRoute(selectedRoute.id)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Descargada en dispositivo
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => downloadRouteOffline(selectedRoute.id)}
              >
                <Download className="w-4 h-4 mr-1.5" /> Descargar Offline (~{offlineMB} MB)
              </Button>
            )}

            <Button
              variant="secondary"
              className="text-xs px-4"
              onClick={() => handleNativeShare(selectedRoute)}
            >
              <Share2 className="w-4 h-4 mr-1.5" /> Compartir
            </Button>
          </div>

          <Button
            variant="default"
            className="w-full bg-[#064e3b] hover:bg-[#043e2f] text-white py-3 rounded-xl gap-2 font-bold text-xs uppercase tracking-wider shadow-md"
            onClick={() => {
              const target = selectedRoute;
              setSelectedRoute(null);
              onSelectRouteForActivity(target);
            }}
          >
            <Play className="w-4 h-4 fill-white" />
            Iniciar Expedición en esta Ruta
          </Button>
        </div>
      </div>
    );
  }

  // Screen 1: Route Catalog & Search List
  return (
    <div className="space-y-4 pb-8">
      {/* Header Banner */}
      <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
          <Compass className="w-4 h-4" />
          <span>Bolivia Trekking Explorer (V1.0)</span>
        </div>
        <h1 className="text-xl font-bold mt-1">Descubre Rutas Verificadas</h1>
        <p className="text-xs text-emerald-100/80 mt-1">
          Senderos andinos, precolombinos y valles en La Paz y Yungas con mapas topográficos sin conexión.
        </p>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar Takesi, Choro, Valle de las Ánimas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-emerald-200/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-emerald-200/80 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Dificultad:
          </span>
          {(['todas', 'facil', 'moderado', 'dificil', 'experto'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-full capitalize whitespace-nowrap transition-all text-xs font-medium cursor-pointer ${selectedDifficulty === diff
                  ? 'bg-white text-emerald-950 font-bold shadow-xs'
                  : 'bg-white/15 text-emerald-100 hover:bg-white/25'
                }`}
            >
              {diff === 'todas' ? 'Todas' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Routes Count */}
      <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-medium">
        <span>{filteredRoutes.length} rutas encontradas</span>
        <span className="flex items-center gap-1 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> Listas para modo offline
        </span>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRoutes.map((route) => {
          const isCached = offlineRouteIds.includes(route.id);

          return (
            <Card
              key={route.id}
              className="overflow-hidden hover:shadow-md transition-all cursor-pointer border-stone-200 group"
              onClick={() => handleCardClick(route)}
            >
              <div className="h-44 w-full relative bg-stone-800 overflow-hidden">
                <TrekkingMap
                  center={[route.startPoint.lat, route.startPoint.lng]}
                  zoom={11}
                  waypoints={route.waypoints}
                  checkpoints={route.checkpoints}
                  startPoint={route.startPoint}
                  endPoint={route.endPoint}
                  interactive={false}
                  className="h-full w-full pointer-events-none"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge difficulty={route.difficulty} className="shadow-xs text-[10px] capitalize">
                    {route.difficulty}
                  </Badge>
                  {isCached && (
                    <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Offline
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <button
                    onClick={(e) => handleNativeShare(route, e)}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
                    title="Compartir ruta con Expo Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                    {route.region}
                  </span>
                  <h3 className="font-extrabold text-base leading-snug group-hover:text-emerald-300 transition-colors">
                    {route.title}
                  </h3>
                </div>
              </div>

              <CardContent className="p-3.5 space-y-2.5">
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {route.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">{route.distanceKm} km</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">{formatDuration(route.durationMinutes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold capitalize truncate">{route.modality}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-400">
                    {route.checkpoints.length} puntos registrados
                  </span>
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ver Ficha Completa <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
