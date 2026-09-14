import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Compass,
  FileCheck,
  ArrowLeft,
} from 'lucide-react';
import { RouteModel } from '../../../core/domain/types';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TrekkingMap } from '../../components/map/TrekkingMap';
import { formatDuration } from '../../../core/domain/calculations';

export const ModerationView: React.FC = () => {
  const { isModerator, isAdmin, currentUser } = useAuth();
  const { routes, updateRoute } = useTrekkingStore();

  const [selectedRoute, setSelectedRoute] = useState<RouteModel | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Filter routes that are in_review or rejected
  const reviewQueue = routes.filter(
    (r) => r.status === 'in_review' || r.status === 'rejected'
  );

  const handleApprove = (route: RouteModel) => {
    updateRoute(route.id, {
      status: 'published',
      moderationNotes: 'Ruta validada con éxito por moderador de montaña.',
      reviewedBy: currentUser?.displayName || 'Moderador Andino',
      reviewedAt: Date.now(),
    });
    setSelectedRoute(null);
  };

  const handleReject = (route: RouteModel) => {
    if (!rejectReason.trim()) {
      alert('Debes ingresar un motivo y observaciones claras para el rechazo (RF-34).');
      return;
    }

    updateRoute(route.id, {
      status: 'rejected',
      moderationNotes: rejectReason,
      reviewedBy: currentUser?.displayName || 'Moderador Andino',
      reviewedAt: Date.now(),
    });

    setIsRejecting(false);
    setRejectReason('');
    setSelectedRoute(null);
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-stone-500 space-y-2">
        <ShieldCheck className="w-10 h-10 mx-auto text-stone-400 stroke-1" />
        <h3 className="font-bold text-stone-800 text-sm">Acceso Restringido</h3>
        <p className="text-xs">
          Esta vista técnica requiere el rol de <b>Administrador</b> (HU-07).
        </p>
        <p className="text-[11px] text-stone-400">
          Inicia sesión con credenciales de Administrador para evaluar y dictaminar rutas de la comunidad.
        </p>
      </div>
    );
  }

  // Screen 2: Dedicated Full Screen Technical Evaluation View
  if (selectedRoute) {
    return (
      <div className="space-y-4 pb-8 animate-in fade-in">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200 shadow-xs sticky top-0 z-20">
          <button
            onClick={() => {
              setSelectedRoute(null);
              setIsRejecting(false);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Bandeja</span>
          </button>
          <Badge status={selectedRoute.status} className="capitalize text-xs">
            {selectedRoute.status === 'in_review' ? 'En Revisión' : selectedRoute.status}
          </Badge>
        </div>

        {/* Route Header */}
        <div className="bg-[#051712] text-white p-4 rounded-2xl border border-[#12382c] shadow-md space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
            Revisión Técnica de Moderación (HU-09)
          </span>
          <h1 className="text-lg font-black text-white leading-tight">
            {selectedRoute.title}
          </h1>
          <p className="text-xs text-stone-300">
            Autor: <b className="text-white">{selectedRoute.creatorName}</b> · Región: {selectedRoute.region}
          </p>
        </div>

        {/* Map Review */}
        <Card className="p-3 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 px-1">
            <span>Inspección de Trazado & Checkpoints</span>
            <span className="text-[10px] text-stone-400 font-mono">
              {selectedRoute.waypoints.length} waypoints
            </span>
          </div>
          <TrekkingMap
            waypoints={selectedRoute.waypoints}
            checkpoints={selectedRoute.checkpoints}
            startPoint={selectedRoute.startPoint}
            endPoint={selectedRoute.endPoint}
            className="h-56 w-full rounded-xl"
          />
        </Card>

        {/* Technical Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-stone-200 text-center text-xs shadow-xs">
          <div>
            <span className="text-[10px] text-stone-400 block uppercase">Distancia</span>
            <span className="font-bold text-stone-800">{selectedRoute.distanceKm} km</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block uppercase">Dificultad</span>
            <span className="font-bold text-emerald-700 capitalize">
              {selectedRoute.difficulty}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block uppercase">Checkpoints</span>
            <span className="font-bold text-stone-800">
              {selectedRoute.checkpoints.length} puntos
            </span>
          </div>
        </div>

        {/* Description */}
        <Card className="p-4 bg-white space-y-1.5">
          <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">
            Descripción Técnica del Creador
          </h4>
          <p className="text-stone-600 text-xs leading-relaxed">
            {selectedRoute.description}
          </p>
        </Card>

        {/* Reject form if user clicked Reject */}
        {isRejecting && (
          <div className="space-y-3 bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-sm animate-in fade-in">
            <label className="block text-xs font-bold text-rose-900">
              Motivo y Observaciones de Rechazo (Obligatorio para el creador)
            </label>
            <textarea
              rows={3}
              placeholder="Ej. El trazado GPS presenta saltos atípicos en el tramo del abra, y no se documentaron fuentes de agua..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setIsRejecting(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs ml-auto"
                onClick={() => handleReject(selectedRoute)}
              >
                Confirmar Rechazo y Enviar Observaciones
              </Button>
            </div>
          </div>
        )}

        {/* Decision Actions */}
        {!isRejecting && (
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2.5">
            <Button
              variant="outline"
              className="flex-1 text-xs text-rose-700 border-rose-300 hover:bg-rose-50 py-3 rounded-xl font-bold"
              onClick={() => setIsRejecting(true)}
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Rechazar con Observaciones
            </Button>
            <Button
              variant="default"
              className="flex-1 text-xs bg-[#064e3b] hover:bg-[#043e2f] text-white py-3 rounded-xl font-bold shadow-md"
              onClick={() => handleApprove(selectedRoute)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aprobar y Publicar
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Screen 1: Moderation Queue List
  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-sm border border-emerald-800">
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Módulo de Calidad & Revisión (HU-09)</span>
        </div>
        <h1 className="text-xl font-bold mt-1">Bandeja de Moderación</h1>
        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
          Valida el cumplimiento de criterios técnicos y de seguridad (trazado GPS verificado, checkpoints y normas de montaña) antes de que una ruta sea pública en el catálogo.
        </p>
      </div>

      {/* Review Queue Count */}
      <div className="flex items-center justify-between px-1 text-xs text-stone-600 font-medium">
        <span>{reviewQueue.length} rutas en espera de revisión</span>
        <span className="text-emerald-700 font-semibold">Rol activo: {currentUser?.role?.toUpperCase()}</span>
      </div>

      {reviewQueue.length === 0 ? (
        <Card className="p-8 text-center text-stone-500 bg-stone-50 border-dashed rounded-2xl">
          <FileCheck className="w-10 h-10 mx-auto text-emerald-600 mb-2 stroke-1" />
          <p className="text-sm font-bold text-stone-800">No hay rutas pendientes de moderación</p>
          <p className="text-xs text-stone-400 mt-1">
            Puedes grabar o crear una ruta nueva en la pestaña <b>Grabar</b> y enviarla a revisión para verla aparecer aquí.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviewQueue.map((route) => (
            <Card
              key={route.id}
              className="p-4 hover:border-emerald-500 transition-all cursor-pointer border-stone-200 group"
              onClick={() => setSelectedRoute(route)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Badge status={route.status} className="capitalize text-[10px]">
                  {route.status === 'in_review' ? 'En Revisión' : 'Rechazada'}
                </Badge>
                <span className="text-[11px] text-stone-400">
                  Creador: <b className="text-stone-700">{route.creatorName}</b>
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-stone-900 leading-tight group-hover:text-emerald-800 transition-colors">
                {route.title}
              </h3>
              <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                {route.description}
              </p>

              {route.moderationNotes && (
                <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  <b>Observaciones registradas:</b> {route.moderationNotes}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-xs text-stone-500">
                <span>{route.distanceKm} km · {formatDuration(route.durationMinutes)}</span>
                <span className="text-emerald-800 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <Eye className="w-3.5 h-3.5" /> Evaluar en Pantalla Completa
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
