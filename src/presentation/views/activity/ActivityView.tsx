import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  StopCircle,
  MapPin,
  Clock,
  Compass,
  CheckCircle,
  AlertTriangle,
  History,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { RouteModel, Coordinates } from '../../../core/domain/types';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TrekkingMap } from '../../components/map/TrekkingMap';
import {
  calculateHaversineDistanceKm,
  formatDuration,
} from '../../../core/domain/calculations';

interface ActivityViewProps {
  preparedRoute: RouteModel | null;
  onClearPreparedRoute: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  preparedRoute,
  onClearPreparedRoute,
}) => {
  const { currentUser } = useAuth();
  const {
    activeActivity,
    routes,
    activitiesHistory,
    startActivityOnRoute,
    pauseActivity,
    resumeActivity,
    finishActivity,
    updateActivityPosition,
    toggleCheckpointCompleted,
    simulateGpsMovement,
  } = useTrekkingStore();

  // Simulated GPS location for testing (defaults to near start point of selected route)
  const [currentGps, setCurrentGps] = useState<Coordinates>({
    lat: preparedRoute?.startPoint.lat || -16.5385,
    lng: preparedRoute?.startPoint.lng || -67.8924,
    altitude: 4300,
  });

  // Calculate distance to official start (RF-13)
  const distanceToStartKm = preparedRoute
    ? calculateHaversineDistanceKm(
        currentGps.lat,
        currentGps.lng,
        preparedRoute.startPoint.lat,
        preparedRoute.startPoint.lng
      )
    : 0;

  // Timer loop for active activity
  useEffect(() => {
    if (!activeActivity.isActive || activeActivity.isPaused) return;

    const timer = setInterval(() => {
      // Simulate real-time ticking
      useTrekkingStore.setState((state) => ({
        activeActivity: {
          ...state.activeActivity,
          elapsedSeconds: state.activeActivity.elapsedSeconds + 1,
        },
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeActivity.isActive, activeActivity.isPaused]);

  // Find active route object
  const currentRunningRoute = routes.find((r) => r.id === activeActivity.routeId);

  // 1. If currently in an active activity (RF-15, RF-16, RF-17, RF-18, RF-19)
  if (activeActivity.isActive) {
    const elapsedMinutes = Math.floor(activeActivity.elapsedSeconds / 60);
    const elapsedSecRemainder = activeActivity.elapsedSeconds % 60;
    const timeDisplay = `${String(elapsedMinutes).padStart(2, '0')}:${String(
      elapsedSecRemainder
    ).padStart(2, '0')}`;

    return (
      <div className="space-y-4 pb-8">
        {/* Active Banner */}
        <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Actividad en curso
            </span>
            <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-md text-emerald-200">
              {activeActivity.isPaused ? 'EN PAUSA' : 'REGISTRANDO'}
            </span>
          </div>
          <h2 className="text-lg font-bold mt-1 text-stone-100">
            {activeActivity.routeTitle}
          </h2>

          {/* Live Metrics Grid (RF-16) */}
          <div className="grid grid-cols-3 gap-2 mt-3 bg-black/30 p-2.5 rounded-xl border border-white/10 text-center">
            <div>
              <span className="text-[10px] text-stone-300 block uppercase">Recorrido</span>
              <span className="text-base font-extrabold text-white">
                {activeActivity.distanceCoveredKm.toFixed(2)} km
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-300 block uppercase">Restante aprox.</span>
              <span className="text-base font-extrabold text-amber-300">
                {activeActivity.remainingDistanceKm.toFixed(2)} km
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-300 block uppercase">Tiempo</span>
              <span className="text-base font-extrabold text-emerald-300 font-mono">
                {timeDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Live Interactive Map (RF-15: trazado oficial, posición actual, checkpoints) */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1 px-1">
            <span>Mapa en Vivo de la Ruta</span>
            <button
              onClick={() => simulateGpsMovement()}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-500" /> Simular Paso GPS
            </button>
          </div>
          <TrekkingMap
            waypoints={activeActivity.officialWaypoints}
            checkpoints={activeActivity.officialCheckpoints}
            currentPosition={activeActivity.currentPosition}
            className="h-64 w-full"
          />
        </div>

        {/* Checkpoints Read-Only Checklist (RF-17) */}
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
          <h4 className="font-semibold text-stone-800 mb-2 flex items-center justify-between">
            <span>Checkpoints y Puntos de Referencia</span>
            <span className="text-[11px] text-stone-500">
              {activeActivity.completedCheckpointIds.length}/
              {activeActivity.officialCheckpoints.length} alcanzados
            </span>
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {activeActivity.officialCheckpoints.map((cp) => {
              const isChecked = activeActivity.completedCheckpointIds.includes(cp.id);
              return (
                <div
                  key={cp.id}
                  onClick={() => toggleCheckpointCompleted(cp.id)}
                  className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                      : 'bg-white border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {cp.category === 'agua' && '💧'}
                      {cp.category === 'camping' && '⛺'}
                      {cp.category === 'peligro' && '⚠️'}
                      {cp.category === 'vista' && '📷'}
                      {cp.category === 'refugio' && '🏠'}
                      {cp.category === 'descanso' && '🛑'}
                    </span>
                    <div>
                      <p className="font-medium text-xs">{cp.name}</p>
                      <p className="text-[10px] text-stone-400 capitalize">{cp.category}</p>
                    </div>
                  </div>
                  <CheckCircle
                    className={`w-4 h-4 ${
                      isChecked ? 'text-emerald-600 fill-emerald-100' : 'text-stone-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls: Pause / Resume / Finish (RF-18, RF-19) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {activeActivity.isPaused ? (
            <Button
              variant="default"
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              onClick={resumeActivity}
            >
              <Play className="w-4 h-4 fill-white mr-1.5" /> Reanudar
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="border border-stone-300"
              onClick={pauseActivity}
            >
              <Pause className="w-4 h-4 mr-1.5" /> Pausar
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={() => {
              const userName = currentUser?.displayName || 'Alejandro Cortés';
              const userId = currentUser?.uid || 'user-anon';
              finishActivity(userId, userName);
            }}
          >
            <StopCircle className="w-4 h-4 mr-1.5" /> Finalizar Ruta
          </Button>
        </div>

        <p className="text-[11px] text-stone-400 text-center">
          * Si finalizas antes del destino final ({activeActivity.remainingDistanceKm.toFixed(1)} km restantes), se guardará automáticamente como <b>Incompleta</b> (RF-19).
        </p>
      </div>
    );
  }

  // 2. Preparation View before starting (RF-12, RF-13)
  if (preparedRoute) {
    return (
      <div className="space-y-4 pb-8">
        <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold uppercase">
            <span>Vista de Preparación (RF-12)</span>
            <Badge difficulty={preparedRoute.difficulty} className="text-white border-white/20">
              {preparedRoute.difficulty}
            </Badge>
          </div>
          <h2 className="text-lg font-bold mt-1">{preparedRoute.title}</h2>
          <p className="text-xs text-emerald-100/80">{preparedRoute.region}</p>
        </div>

        {/* Distance to Start Point (RF-13) */}
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-900">Ubicación Actual vs. Inicio Oficial</span>
            <p className="text-stone-700 mt-0.5">
              Punto inicial: <b>{preparedRoute.startPoint.name}</b>
            </p>
            <p className="text-amber-800 font-semibold mt-1">
              Estás a aproximadamente <b>{distanceToStartKm.toFixed(2)} km</b> del punto oficial de partida.
            </p>
          </div>
        </div>

        {/* Mountain Safety & Checklist */}
        <div className="border border-stone-200 rounded-xl p-3.5 bg-white space-y-2 text-xs">
          <h3 className="font-semibold text-stone-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
            Checklist de Seguridad en Montaña Boliviana
          </h3>
          <ul className="space-y-1.5 text-stone-600 pl-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Ropa térmica y cortavientos (vientos gélidos en cumbres &gt;4,500 msnm).
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Mínimo 2 litros de agua y pastillas de purificación.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Mapa y trazado descargados previamente en el dispositivo para uso offline.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Batería del teléfono al 100% y powerbank de respaldo.
            </li>
          </ul>
        </div>

        {/* Route Map Preview */}
        <TrekkingMap
          waypoints={preparedRoute.waypoints}
          checkpoints={preparedRoute.checkpoints}
          startPoint={preparedRoute.startPoint}
          endPoint={preparedRoute.endPoint}
          className="h-56 w-full"
        />

        {/* Explicit Action to Start (RF-14) */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={onClearPreparedRoute}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
            onClick={() => {
              startActivityOnRoute(preparedRoute, {
                lat: preparedRoute.startPoint.lat,
                lng: preparedRoute.startPoint.lng,
                altitude: 4300,
                timestamp: Date.now(),
              });
              onClearPreparedRoute();
            }}
          >
            <Play className="w-4 h-4 fill-white" /> Iniciar Actividad Oficial
          </Button>
        </div>
      </div>
    );
  }

  // 3. Default view: History and prompt to select a route (RF-20)
  return (
    <div className="space-y-4 pb-8">
      <div className="bg-stone-900 text-white p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold uppercase">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Monitor de Campo</span>
        </div>
        <h1 className="text-xl font-bold mt-1">Actividad de Trekking</h1>
        <p className="text-xs text-stone-300 mt-1">
          No tienes una actividad en curso en este momento. Selecciona una ruta publicada del catálogo para iniciar tu recorrido.
        </p>
      </div>

      {/* History of Personal Activities (RF-20) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700 px-1">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-700" /> Tu Historial Personal
          </span>
          <span className="text-stone-400">{activitiesHistory.length} registradas</span>
        </div>

        {activitiesHistory.length === 0 ? (
          <Card className="p-6 text-center text-stone-500 bg-stone-50 border-dashed">
            <Compass className="w-8 h-8 mx-auto text-stone-400 mb-2 stroke-1" />
            <p className="text-xs font-medium">Aún no has completado actividades.</p>
            <p className="text-[11px] text-stone-400 mt-1">
              Ve a la pestaña <b>Explorar</b>, abre una ruta como la del <i>Takesi</i> o <i>Valle de las Ánimas</i> y presiona "Iniciar Ruta".
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {activitiesHistory.map((act) => {
              const isComplete = act.status === 'completed';
              const dateStr = new Date(act.startedAt).toLocaleDateString('es-BO', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Card key={act.id} className="p-3.5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-sm">{act.routeTitle}</span>
                    <Badge
                      variant={isComplete ? 'success' : 'warning'}
                      className="text-[10px]"
                    >
                      {isComplete ? 'Completada' : 'Incompleta (RF-19)'}
                    </Badge>
                  </div>
                  <p className="text-stone-400 text-[11px] mb-2">{dateStr}</p>
                  <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2 rounded-lg text-center border border-stone-100">
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase block">Recorrido</span>
                      <span className="font-bold text-stone-800">{act.distanceCoveredKm} km</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase block">Tiempo</span>
                      <span className="font-bold text-stone-800">
                        {Math.floor(act.durationSeconds / 60)} min
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase block">Checkpoints</span>
                      <span className="font-bold text-emerald-700">
                        {act.completedCheckpoints.length}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
