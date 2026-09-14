import React, { useState } from 'react';
import {
  User,
  Shield,
  LogOut,
  Users,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
  Unlock,
  UserCheck,
  Award,
  HardDrive,
  Map,
} from 'lucide-react';
import { UserRole } from '../../../core/domain/types';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { activityService } from '../../../infrastructure/database/activityService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { OfflineMapManager } from '../../components/map/OfflineMapManager';
import { OfflineStorageDashboard } from '../../components/map/OfflineStorageDashboard';

export const ProfileView: React.FC = () => {
  const { currentUser, switchDemoRole, logout, isAdmin } = useAuth();
  const {
    isOfflineMode,
    toggleOfflineMode,
    usersList,
    toggleUserBlocked,
    setUserRole,
    activitiesHistory,
    syncPendingActivities,
  } = useTrekkingStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [mapStorageTab, setMapStorageTab] = useState<'dashboard' | 'manager'>('dashboard');

  // Trigger Firestore cloud synchronization (RNF-02, RNF-03)
  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      let count = 0;
      for (const act of activitiesHistory) {
        await activityService.saveActivity({ ...act, isSynced: true });
        count++;
      }
      syncPendingActivities();
      setSyncStatusMsg(`¡Sincronización con Firestore exitosa! (${count} actividades sincronizadas con la nube)`);
    } catch (err) {
      setSyncStatusMsg('Operación completada en almacenamiento local (modo offline activo).');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* User Header */}
      <div className="bg-stone-900 text-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg border-2 border-emerald-500">
              {currentUser?.displayName?.substring(0, 2).toUpperCase() || 'TR'}
            </div>
            <div>
              <h2 className="font-bold text-base">{currentUser?.displayName}</h2>
              <p className="text-xs text-stone-400">{currentUser?.email}</p>
            </div>
          </div>
          <Badge
            variant={currentUser?.role === 'admin' ? 'danger' : 'success'}
            className="capitalize text-xs font-bold px-2.5 py-1"
          >
            Rol: {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
          </Badge>
        </div>
      </div>

      {/* Offline Mode & Synchronization (RNF-01, RNF-02) */}
      <Card className="p-4 bg-emerald-50/60 border-emerald-200 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            {isOfflineMode ? (
              <WifiOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-600" />
            )}
            <span>Estado de Red / Campo</span>
          </div>
          <button
            onClick={() => toggleOfflineMode()}
            className={`px-3 py-1 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${
              isOfflineMode
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-700 text-white'
            }`}
          >
            {isOfflineMode ? 'Modo Offline Activado' : 'Conectado a Internet'}
          </button>
        </div>
        <p className="text-stone-600 leading-relaxed">
          {isOfflineMode
            ? 'La aplicación opera de manera 100% autónoma sin internet (RNF-01). Los mapas y trazados guardados en caché local están listos para la montaña.'
            : 'Conectado al servidor central de Trekking Bolivia y Firestore.'}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs bg-white border-emerald-300 text-emerald-800"
            disabled={isSyncing}
            onClick={handleCloudSync}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar con Firestore (Nube)'}
          </Button>
        </div>
        {syncStatusMsg && (
          <p className="text-[11px] text-emerald-800 font-medium bg-emerald-100/70 p-2 rounded-md">
            {syncStatusMsg}
          </p>
        )}
      </Card>

      {/* Offline Maps & Storage Dashboard (IndexedDB) */}
      <Card className="p-4 bg-white border border-stone-200 shadow-xs space-y-3.5">
        {/* Sub-tab Navigation */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex gap-1.5 p-1 bg-stone-100 rounded-lg text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setMapStorageTab('dashboard')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mapStorageTab === 'dashboard'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" /> Dashboard Almacenamiento
            </button>
            <button
              onClick={() => setMapStorageTab('manager')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mapStorageTab === 'manager'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" /> Descargar y Zonas
            </button>
          </div>
        </div>

        {mapStorageTab === 'dashboard' ? (
          <OfflineStorageDashboard onGoToDownload={() => setMapStorageTab('manager')} />
        ) : (
          <OfflineMapManager />
        )}
      </Card>

      {/* Switch Test Persona (CU-02, RF-03) */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-2.5">
        <h3 className="font-semibold text-stone-900 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-700" />
          Probar con Distintos Perfiles y Roles (RBAC)
        </h3>
        <p className="text-stone-500 text-[11px]">
          Alterna rápidamente entre las identidades de usuario para verificar permisos:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => switchDemoRole('user')}
            className={`p-2 rounded-lg border text-center font-medium transition-all cursor-pointer ${
              currentUser?.role === 'user'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span className="block font-bold">Usuario</span>
            <span className="text-[10px] text-stone-400">Alejandro C.</span>
          </button>
          <button
            onClick={() => switchDemoRole('admin')}
            className={`p-2 rounded-lg border text-center font-medium transition-all cursor-pointer ${
              currentUser?.role === 'admin'
                ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span className="block font-bold">Admin</span>
            <span className="text-[10px] text-stone-400">Administrador</span>
          </button>
        </div>
      </div>

      {/* Admin Panel: Manage Users and Assign Roles (RF-04, CU-11) */}
      {isAdmin && (
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-700" />
              Gestión de Usuarios y Roles (RF-04)
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              Solo Administrador
            </span>
          </div>
          <p className="text-stone-500 text-[11px]">
            Consulta usuarios registrados, bloquea o desbloquea cuentas y promueve a Moderador:
          </p>

          <div className="space-y-2">
            {usersList.map((usr) => (
              <div
                key={usr.uid}
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                  usr.isBlocked
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div>
                  <p className="font-bold text-stone-900">
                    {usr.displayName}{' '}
                    {usr.isBlocked && (
                      <span className="text-rose-600 font-bold text-[10px]">(BLOQUEADO)</span>
                    )}
                  </p>
                  <p className="text-stone-400 text-[10px]">{usr.email}</p>
                  <p className="text-stone-500 text-[10px] capitalize mt-0.5">
                    Rol actual: <b>{usr.role}</b>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Block / Unblock */}
                  {usr.role !== 'admin' && (
                    <Button
                      variant={usr.isBlocked ? 'default' : 'destructive'}
                      size="sm"
                      className="text-[10px] h-7 px-2"
                      onClick={() => toggleUserBlocked(usr.uid)}
                    >
                      {usr.isBlocked ? (
                        <>
                          <Unlock className="w-3 h-3 mr-1" /> Desbloquear
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" /> Bloquear
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign Out Button */}
      <Button
        variant="outline"
        className="w-full text-xs border-stone-300 text-stone-700"
        onClick={() => logout()}
      >
        <LogOut className="w-3.5 h-3.5 mr-1" /> Cerrar Sesión
      </Button>
    </div>
  );
};
