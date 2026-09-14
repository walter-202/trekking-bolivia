import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  StopCircle,
  Plus,
  Camera,
  MapPin,
  Save,
  CheckCircle2,
  Navigation,
  Compass,
  AlertCircle,
  FileEdit,
  Send,
  Lock,
  Globe,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { CheckpointCategory, Checkpoint, Coordinates } from '../../../core/domain/types';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { TrekkingMap } from '../../components/map/TrekkingMap';
import {
  calculateTrackDistanceKm,
  suggestRouteDifficulty,
  calculateOfflineSizeMB,
} from '../../../core/domain/calculations';

export const RecordView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activeRecording,
    draftRoute,
    startGpsRecording,
    pauseRecording,
    resumeRecording,
    addCheckpointToRecording,
    addPhotoToRecording,
    finishRecording,
    discardRecording,
    setDraftRoute,
    updateDraftPoints,
    confirmRealStart,
    updateRoute,
    simulateGpsMovement,
  } = useTrekkingStore();

  const [mode, setMode] = useState<'record' | 'plan'>('record');

  // Draft planning state (RF-21, RF-22, RF-23, RF-24, RF-25)
  const [draftTitle, setDraftTitle] = useState(draftRoute?.title || '');
  const [draftDesc, setDraftDesc] = useState(draftRoute?.description || '');
  const [draftStartName, setDraftStartName] = useState(draftRoute?.startPoint?.name || 'Punto Inicial Previsto');
  const [draftEndName, setDraftEndName] = useState(draftRoute?.endPoint?.name || 'Destino Provisional');
  const [draftStartCoords, setDraftStartCoords] = useState<Coordinates>({
    lat: draftRoute?.startPoint?.lat || -16.5385,
    lng: draftRoute?.startPoint?.lng || -67.8924,
  });
  const [draftEndCoords, setDraftEndCoords] = useState<Coordinates>({
    lat: draftRoute?.endPoint?.lat || -16.3982,
    lng: draftRoute?.endPoint?.lng || -67.7421,
  });

  // Modal for adding a checkpoint during recording (RF-28, RF-29)
  const [isAddingCheckpoint, setIsAddingCheckpoint] = useState(false);
  const [cpName, setCpName] = useState('');
  const [cpCategory, setCpCategory] = useState<CheckpointCategory>('agua');
  const [cpNotes, setCpNotes] = useState('');
  const [cpPhoto, setCpPhoto] = useState('');

  // Finish Recording Modal (RF-31, RF-32, RF-33, RF-35)
  const [isFinishing, setIsFinishing] = useState(false);
  const [finalEndPointName, setFinalEndPointName] = useState('Llegada Final');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitForReviewNow, setSubmitForReviewNow] = useState(true);

  // Timer loop for active recording
  useEffect(() => {
    if (!activeRecording.isRecording || activeRecording.isPaused) return;

    const timer = setInterval(() => {
      useTrekkingStore.setState((state) => ({
        activeRecording: {
          ...state.activeRecording,
          elapsedSeconds: state.activeRecording.elapsedSeconds + 1,
        },
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRecording.isRecording, activeRecording.isPaused]);

  // Handle Draft Save (RF-23)
  const handleSaveDraft = () => {
    updateDraftPoints(
      { name: draftStartName, lat: draftStartCoords.lat, lng: draftStartCoords.lng },
      { name: draftEndName, lat: draftEndCoords.lat, lng: draftEndCoords.lng }
    );
    setDraftRoute({
      title: draftTitle || 'Planificación en Borrador',
      description: draftDesc || 'Ruta planificada previamente sin exigencia de trazado GPS inmediato.',
      region: 'Andes / Bolivia',
      startPoint: { name: draftStartName, lat: draftStartCoords.lat, lng: draftStartCoords.lng },
      endPoint: { name: draftEndName, lat: draftEndCoords.lat, lng: draftEndCoords.lng },
      status: 'draft',
      waypoints: [draftStartCoords, draftEndCoords],
      checkpoints: [],
      photos: [],
    });
    alert('¡Borrador guardado exitosamente! Puedes recuperarlo o iniciar la grabación al llegar al sitio.');
  };

  // Start Live Recording (RF-26)
  const handleStartRecording = () => {
    const startPos: Coordinates = draftRoute?.startPoint
      ? { lat: draftRoute.startPoint.lat, lng: draftRoute.startPoint.lng, altitude: 4100, timestamp: Date.now() }
      : { lat: -16.5385, lng: -67.8924, altitude: 4100, timestamp: Date.now() };

    startGpsRecording(
      startPos,
      draftRoute?.title || 'Levantamiento de Ruta en Bolivia',
      draftRoute?.description || 'Grabación GPS en vivo.'
    );
  };

  // Add Checkpoint (RF-28, RF-29)
  const handleSaveCheckpoint = () => {
    if (!cpName.trim()) return;
    const lastPos =
      activeRecording.waypoints[activeRecording.waypoints.length - 1] || {
        lat: -16.5385,
        lng: -67.8924,
      };

    const newCp: Checkpoint = {
      id: `cp-${Date.now()}`,
      name: cpName,
      category: cpCategory,
      lat: lastPos.lat,
      lng: lastPos.lng,
      notes: cpNotes || undefined,
      photoUrl: cpPhoto || undefined,
      createdAt: Date.now(),
    };

    addCheckpointToRecording(newCp);
    setIsAddingCheckpoint(false);
    setCpName('');
    setCpNotes('');
    setCpPhoto('');
  };

  // Confirm Finish (RF-31, RF-32, RF-33, RF-35)
  const handleConfirmFinish = () => {
    const creatorId = currentUser?.uid || 'alex-cortes';
    const creatorName = currentUser?.displayName || 'Alejandro Cortés';
    const lastPos =
      activeRecording.waypoints[activeRecording.waypoints.length - 1] || {
        lat: -16.3982,
        lng: -67.7421,
      };

    const savedRoute = finishRecording(
      creatorId,
      creatorName,
      { name: finalEndPointName, lat: lastPos.lat, lng: lastPos.lng },
      isPrivate
    );

    // If requesting review (RF-33)
    if (submitForReviewNow && !isPrivate) {
      updateRoute(savedRoute.id, { status: 'in_review' });
    }

    setIsFinishing(false);
  };

  // If in active recording state (RF-27 to RF-32)
  if (activeRecording.isRecording) {
    const elapsedMinutes = Math.floor(activeRecording.elapsedSeconds / 60);
    const elapsedSecondsRemainder = activeRecording.elapsedSeconds % 60;
    const timeDisplay = `${String(elapsedMinutes).padStart(2, '0')}:${String(
      elapsedSecondsRemainder
    ).padStart(2, '0')}`;

    const suggestedDiff = suggestRouteDifficulty(
      activeRecording.accumulatedDistanceKm,
      elapsedMinutes
    );

    // Screen 2A: Dedicated Add Checkpoint Screen (Replaces modal)
    if (isAddingCheckpoint) {
      return (
        <div className="space-y-4 pb-8 animate-in fade-in">
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <button
              onClick={() => setIsAddingCheckpoint(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Grabación</span>
            </button>
            <span className="text-[10px] font-bold text-stone-400 uppercase">
              Nuevo Checkpoint
            </span>
          </div>

          <Card className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3.5">
            <div>
              <h3 className="font-extrabold text-sm text-stone-900">
                Añadir Punto Georreferenciado (RF-28)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Se asociará automáticamente a las coordenadas GPS actuales de tu posición en montaña.
              </p>
            </div>

            <Input
              label="Nombre del Punto"
              placeholder="Ej. Fuente de Agua Deshielo / Choza Kakapi"
              value={cpName}
              onChange={(e) => setCpName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Categoría
              </label>
              <select
                value={cpCategory}
                onChange={(e) => setCpCategory(e.target.value as CheckpointCategory)}
                className="w-full h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="agua">💧 Agua Potable / Vertiente</option>
                <option value="camping">⛺ Zona de Acampe</option>
                <option value="peligro">⚠️ Zona de Riesgo / Despeñadero</option>
                <option value="vista">📷 Mirador Panorámico</option>
                <option value="refugio">🏠 Refugio / Choza</option>
                <option value="descanso">🛑 Sitio de Descanso</option>
              </select>
            </div>

            <Input
              label="Notas Adicionales (Opcional)"
              placeholder="Ej. Agua limpia, no requiere hervir..."
              value={cpNotes}
              onChange={(e) => setCpNotes(e.target.value)}
            />

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setIsAddingCheckpoint(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="flex-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-xs"
                onClick={handleSaveCheckpoint}
              >
                Guardar Punto
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Screen 2B: Dedicated Finalize Recording Screen (Replaces modal)
    if (isFinishing) {
      return (
        <div className="space-y-4 pb-8 animate-in fade-in">
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <button
              onClick={() => setIsFinishing(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continuar Grabando</span>
            </button>
            <span className="text-[10px] font-bold text-emerald-700 uppercase">
              Cierre de Ruta
            </span>
          </div>

          <Card className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3.5">
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                Finalizar Grabación de Ruta (RF-31)
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Distancia registrada: <b>{activeRecording.accumulatedDistanceKm.toFixed(2)} km</b>
                <br />
                Dificultad sugerida por algoritmo: <b className="text-emerald-800">{suggestedDiff.toUpperCase()}</b>
              </p>
            </div>

            <Input
              label="Nombre del Punto Final Real (RF-31)"
              placeholder="Ej. Plaza Principal Yanacachi / Puente Chairo"
              value={finalEndPointName}
              onChange={(e) => setFinalEndPointName(e.target.value)}
            />

            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-500" /> Mantener ruta privada (solo para mí) (RF-35)
                </span>
              </label>

              {!isPrivate && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={submitForReviewNow}
                      onChange={(e) => setSubmitForReviewNow(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span className="flex items-center gap-1 font-semibold text-emerald-900">
                      <Send className="w-3.5 h-3.5 text-emerald-700" /> Solicitar revisión a Moderadores para publicación (RF-33 / HU-09)
                    </span>
                  </label>

                  {submitForReviewNow && (
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-[11px] space-y-1.5 text-emerald-950">
                      <span className="font-bold block text-emerald-900 uppercase tracking-wide text-[10px]">
                        ✓ Lista de Verificación Previa al Envío:
                      </span>
                      <div className="space-y-1 text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Trazado GPS verificado ({activeRecording.waypoints.length} waypoints)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Punto de inicio y fin georreferenciados</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Checkpoints de seguridad ({activeRecording.checkpoints.length} marcados)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Cumplimiento con normas de bajo impacto ambiental andino</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setIsFinishing(false)}
              >
                Volver
              </Button>
              <Button
                variant="default"
                className="flex-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-xs"
                onClick={handleConfirmFinish}
              >
                Guardar y Finalizar
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-8">
        {/* Recording Banner */}
        <div className="bg-amber-950 text-white p-4 rounded-2xl border border-amber-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Grabando Trazado GPS (RF-27)
            </span>
            <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-md text-amber-200">
              {activeRecording.isPaused ? 'EN PAUSA' : 'GRABANDO'}
            </span>
          </div>

          <h2 className="text-base font-bold mt-1 text-white">
            {activeRecording.title || 'Nueva Ruta en Terreno'}
          </h2>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3 bg-black/40 p-2.5 rounded-xl border border-white/10 text-center">
            <div>
              <span className="text-[10px] text-stone-300 block uppercase">Distancia Acum.</span>
              <span className="text-base font-extrabold text-white">
                {activeRecording.accumulatedDistanceKm.toFixed(2)} km
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-300 block uppercase">Tiempo</span>
              <span className="text-base font-extrabold text-amber-300 font-mono">
                {timeDisplay}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-300 block uppercase">Dificultad Sug.</span>
              <span className="text-xs font-bold uppercase text-emerald-400">
                {suggestedDiff}
              </span>
            </div>
          </div>
        </div>

        {/* Live GPS Track Map */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1 px-1">
            <span>Trazado GPS en Terreno</span>
            <button
              onClick={() => simulateGpsMovement()}
              className="text-[11px] text-amber-800 hover:text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-600" /> Simular Paso GPS
            </button>
          </div>
          <TrekkingMap
            waypoints={activeRecording.waypoints}
            checkpoints={activeRecording.checkpoints}
            startPoint={activeRecording.startPoint}
            currentPosition={
              activeRecording.waypoints[activeRecording.waypoints.length - 1] || null
            }
            className="h-64 w-full"
          />
        </div>

        {/* Add Checkpoint Button (RF-28) */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 text-xs border-stone-300 bg-white"
            onClick={() => setIsAddingCheckpoint(true)}
          >
            <Plus className="w-4 h-4 mr-1 text-emerald-700" /> Añadir Checkpoint / Parada (RF-28)
          </Button>
          <Button
            variant="outline"
            className="text-xs px-3 bg-white"
            onClick={() => {
              const url = prompt('Ingresa URL de fotografía o captura de terreno (RF-29):', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');
              if (url) addPhotoToRecording(url);
            }}
          >
            <Camera className="w-4 h-4 text-stone-600 mr-1" /> Foto ({activeRecording.photos.length})
          </Button>
        </div>

        {/* Checkpoints Recorded so far */}
        {activeRecording.checkpoints.length > 0 && (
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
            <span className="font-semibold text-stone-800 block mb-1.5">
              Puntos georreferenciados en esta sesión ({activeRecording.checkpoints.length}):
            </span>
            <div className="space-y-1">
              {activeRecording.checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className="p-1.5 bg-white rounded-md border border-stone-200 flex items-center justify-between text-[11px]"
                >
                  <span className="font-medium text-stone-800">{cp.name}</span>
                  <span className="text-stone-400 uppercase text-[10px]">{cp.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls: Pause / Resume / Finish (RF-30, RF-31) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {activeRecording.isPaused ? (
            <Button
              variant="default"
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              onClick={resumeRecording}
            >
              <Play className="w-4 h-4 fill-white mr-1.5" /> Reanudar
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="border border-stone-300"
              onClick={pauseRecording}
            >
              <Pause className="w-4 h-4 mr-1.5" /> Pausar
            </Button>
          )}

          <Button
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => setIsFinishing(true)}
          >
            <StopCircle className="w-4 h-4 mr-1.5" /> Confirmar Fin (RF-31)
          </Button>
        </div>

      </div>
    );
  }

  // Plan or Start Planning view (RF-21 to RF-25)
  return (
    <div className="space-y-4 pb-8">
      {/* Tab switch between Plan Draft and Direct Start */}
      <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
        <button
          onClick={() => setMode('record')}
          className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
            mode === 'record' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
          }`}
        >
          Grabación In Situ (GPS)
        </button>
        <button
          onClick={() => setMode('plan')}
          className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
            mode === 'plan' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
          }`}
        >
          Planificar Borrador (RF-21)
        </button>
      </div>

      {mode === 'record' ? (
        <div className="space-y-4">
          <div className="bg-emerald-900 text-white p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs uppercase font-bold">
              <Compass className="w-4 h-4" />
              <span>Levantamiento de Campo</span>
            </div>
            <h1 className="text-xl font-bold mt-1">Grabar Nueva Ruta GPS</h1>
            <p className="text-xs text-emerald-100/80 mt-1">
              Registra el trazado exacto de coordenadas mientras caminas. Agrega checkpoints de agua, acampe y fotografías con almacenamiento 100% local sin requerir internet.
            </p>
          </div>

          <Card className="p-4 space-y-3 bg-stone-50 border-stone-200 text-xs">
            <h3 className="font-semibold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              Punto de Partida Actual
            </h3>
            <p className="text-stone-600">
              Coordenadas de inicio detectadas: <b>-16.5385, -67.8924</b> (Ventilla / Mururata).
            </p>
            <p className="text-stone-500 text-[11px]">
              Al presionar "Iniciar Grabación GPS", el sistema registrará cada paso y calculará la distancia acumulada en tiempo real.
            </p>
          </Card>

          <Button
            variant="default"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-6 text-sm font-bold gap-2"
            onClick={handleStartRecording}
          >
            <Play className="w-5 h-5 fill-white" /> Iniciar Grabación GPS (RF-26)
          </Button>
        </div>
      ) : (
        /* Plan Draft Route (RF-21, RF-22, RF-23, RF-24, RF-25) */
        <div className="space-y-3">
          <div className="bg-stone-900 text-white p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs uppercase font-bold">
              <FileEdit className="w-4 h-4 text-emerald-400" />
              <span>Borrador Previo (RF-21)</span>
            </div>
            <h1 className="text-xl font-bold mt-1">Planificar sin Trazado GPS</h1>
            <p className="text-xs text-stone-300 mt-1">
              Define los puntos provisionales de origen y destino sobre el mapa antes de salir a la montaña.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
            <Input
              label="Título de la Planificación"
              placeholder="Ej. Exploración Huayna Potosí Cara Este"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
            />
            <Input
              label="Descripción o Notas Previas"
              placeholder="Ej. Travesía tentativa para buscar nuevas fuentes de agua..."
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Origen Provisional (RF-22)"
                value={draftStartName}
                onChange={(e) => setDraftStartName(e.target.value)}
              />
              <Input
                label="Destino Provisional"
                value={draftEndName}
                onChange={(e) => setDraftEndName(e.target.value)}
              />
            </div>

            {/* Map Click for provisional points */}
            <div>
              <p className="font-semibold text-stone-800 mb-1">
                Haz clic en el mapa para ajustar el punto de inicio provisional:
              </p>
              <TrekkingMap
                waypoints={[draftStartCoords, draftEndCoords]}
                startPoint={{ name: draftStartName, ...draftStartCoords }}
                endPoint={{ name: draftEndName, ...draftEndCoords }}
                onMapClick={(coords) => setDraftStartCoords(coords)}
                className="h-48 w-full"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Inicio fijado en: {draftStartCoords.lat}, {draftStartCoords.lng}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleSaveDraft}
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Guardar Borrador (RF-23)
              </Button>
              <Button
                variant="default"
                className="flex-1 text-xs bg-emerald-700 text-white"
                onClick={() => {
                  handleSaveDraft();
                  handleStartRecording();
                }}
              >
                <Play className="w-3.5 h-3.5 fill-white mr-1" /> Comenzar Ahora
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
