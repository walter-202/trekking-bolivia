import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RouteModel,
  TrekkingActivity,
  Coordinates,
  Checkpoint,
  UserProfile,
  UserRole,
} from '../../core/domain/types';
import { OfflineRegion, TileCacheDB } from './tileCacheDB';
import { SEED_BOLIVIA_ROUTES } from '../../core/domain/seedData';
import { routeService } from '../database/routeService';
import { userProfileService } from '../database/userProfileService';
import {
  calculateTrackDistanceKm,
  suggestRouteDifficulty,
  calculateRemainingDistanceKm,
  calculateHaversineDistanceKm,
} from '../../core/domain/calculations';

export interface ActiveRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  title: string;
  description: string;
  region: string;
  startPoint: { name: string; lat: number; lng: number } | null;
  endPoint: { name: string; lat: number; lng: number } | null;
  waypoints: Coordinates[];
  checkpoints: Checkpoint[];
  photos: string[];
  startTime: number | null;
  elapsedSeconds: number;
  accumulatedDistanceKm: number;
}

export interface ActiveActivityState {
  isActive: boolean;
  isPaused: boolean;
  routeId: string;
  routeTitle: string;
  officialWaypoints: Coordinates[];
  officialCheckpoints: Checkpoint[];
  currentPosition: Coordinates | null;
  distanceCoveredKm: number;
  remainingDistanceKm: number;
  elapsedSeconds: number;
  startTime: number | null;
  completedCheckpointIds: string[];
}

interface TrekkingStore {
  // Routes
  routes: RouteModel[];
  offlineRouteIds: string[];
  setRoutes: (routes: RouteModel[]) => void;
  addRoute: (route: RouteModel) => void;
  updateRoute: (id: string, updates: Partial<RouteModel>) => void;
  downloadRouteOffline: (routeId: string) => void;
  removeOfflineRoute: (routeId: string) => void;
  syncRoutesWithFirestore: () => Promise<void>;
  saveRouteToFirestore: (route: RouteModel) => Promise<void>;
  updateRouteInFirestore: (id: string, updates: Partial<RouteModel>) => Promise<void>;
  deleteRouteFromFirestore: (id: string) => Promise<void>;

  // Draft Planning (RF-21, RF-22, RF-23, RF-25)
  draftRoute: Partial<RouteModel> | null;
  setDraftRoute: (draft: Partial<RouteModel> | null) => void;
  updateDraftPoints: (
    start: { name: string; lat: number; lng: number },
    end: { name: string; lat: number; lng: number }
  ) => void;
  confirmRealStart: (start: { name: string; lat: number; lng: number }) => void;

  // Live GPS Recording (RF-26 to RF-32)
  activeRecording: ActiveRecordingState;
  startGpsRecording: (initialPoint: Coordinates, title?: string, description?: string) => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  addWaypointToRecording: (point: Coordinates) => void;
  addCheckpointToRecording: (checkpoint: Checkpoint) => void;
  addPhotoToRecording: (photoUrl: string) => void;
  finishRecording: (
    creatorId: string,
    creatorName: string,
    finalPoint: { name: string; lat: number; lng: number },
    isPrivate?: boolean
  ) => RouteModel;
  discardRecording: () => void;

  // Existing Route Activity Tracking (RF-12 to RF-20)
  activeActivity: ActiveActivityState;
  startActivityOnRoute: (route: RouteModel, startPos: Coordinates) => void;
  updateActivityPosition: (pos: Coordinates) => void;
  toggleCheckpointCompleted: (checkpointId: string) => void;
  pauseActivity: () => void;
  resumeActivity: () => void;
  finishActivity: (userId: string, userName: string, forceComplete?: boolean) => TrekkingActivity;

  // Personal History
  activitiesHistory: TrekkingActivity[];
  syncPendingActivities: () => void;

  // Offline operation state (RNF-01)
  isOfflineMode: boolean;
  toggleOfflineMode: (offline?: boolean) => void;

  // Offline Map Regions (IndexedDB)
  offlineRegions: OfflineRegion[];
  isDownloadingRegion: boolean;
  downloadProgress: { downloaded: number; total: number; progressPercent: number; sizeBytes: number };
  fetchOfflineRegions: () => Promise<void>;
  addOfflineRegion: (region: OfflineRegion) => void;
  deleteOfflineRegion: (id: string) => Promise<void>;
  setDownloadingState: (
    isDownloading: boolean,
    progress: { downloaded: number; total: number; progressPercent: number; sizeBytes: number }
  ) => void;

  // User Management / RBAC (RF-03, RF-04)
  usersList: UserProfile[];
  toggleUserBlocked: (uid: string) => void;
  setUserRole: (uid: string, role: UserRole) => void;

  // Simulation helpers for Field Testing (GPS simulation without moving physically)
  simulateGpsMovement: () => void;
}

const initialRecording: ActiveRecordingState = {
  isRecording: false,
  isPaused: false,
  title: '',
  description: '',
  region: 'Cordillera Real, Bolivia',
  startPoint: null,
  endPoint: null,
  waypoints: [],
  checkpoints: [],
  photos: [],
  startTime: null,
  elapsedSeconds: 0,
  accumulatedDistanceKm: 0,
};

const initialActivity: ActiveActivityState = {
  isActive: false,
  isPaused: false,
  routeId: '',
  routeTitle: '',
  officialWaypoints: [],
  officialCheckpoints: [],
  currentPosition: null,
  distanceCoveredKm: 0,
  remainingDistanceKm: 0,
  elapsedSeconds: 0,
  startTime: null,
  completedCheckpointIds: [],
};

const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin-wfernando',
    email: 'wfernando.aguilarm@gmail.com',
    displayName: 'Fernando Aguilar',
    username: 'wfernando',
    summitsCount: 48,
    gpsAccuracy: '±1.2m RTK',
    role: 'admin',
    isBlocked: false,
    createdAt: 1717000000000,
  },
  {
    uid: 'admin-pomajurado',
    email: 'pomajuradoc@gmail.com',
    displayName: 'Christian Poma Jurado',
    username: 'pomajurado',
    summitsCount: 35,
    gpsAccuracy: '±1.5m Preciso',
    role: 'admin',
    isBlocked: false,
    createdAt: 1717100000000,
  },
  {
    uid: 'admin-monjequino',
    email: 'monjequinofabianacareliz@gmail.com',
    displayName: 'Fabiana Careliz Monje',
    username: 'monjequino',
    summitsCount: 29,
    gpsAccuracy: '±1.8m Preciso',
    role: 'admin',
    isBlocked: false,
    createdAt: 1717200000000,
  },
  {
    uid: 'admin-cortestrading',
    email: 'Cortestrading@gmail.com',
    displayName: 'Alejandro Cortés',
    username: 'cortestrading',
    summitsCount: 42,
    gpsAccuracy: '±1.4m Preciso',
    role: 'admin',
    isBlocked: false,
    createdAt: 1717300000000,
  },
  {
    uid: 'user-caminante',
    email: 'andino@trekbolivia.bo',
    displayName: 'Caminante Andino',
    username: 'caminante_andino',
    summitsCount: 14,
    gpsAccuracy: '±2.4m Preciso',
    role: 'user',
    isBlocked: false,
    createdAt: 1717400000000,
  },
];

export const useTrekkingStore = create<TrekkingStore>()(
  persist(
    (set, get) => ({
      routes: SEED_BOLIVIA_ROUTES,
      offlineRouteIds: ['route-takesi', 'route-valle-animas'],
      draftRoute: null,
      activeRecording: initialRecording,
      activeActivity: initialActivity,
      activitiesHistory: [],
      isOfflineMode: false,
      usersList: INITIAL_USERS,

      // Offline map regions states
      offlineRegions: [],
      isDownloadingRegion: false,
      downloadProgress: { downloaded: 0, total: 0, progressPercent: 0, sizeBytes: 0 },

      fetchOfflineRegions: async () => {
        const regions = await TileCacheDB.getRegions();
        set({ offlineRegions: regions });
      },

      addOfflineRegion: (region) => {
        set((state) => {
          const exists = state.offlineRegions.some((r) => r.id === region.id);
          const updated = exists
            ? state.offlineRegions.map((r) => (r.id === region.id ? region : r))
            : [...state.offlineRegions, region];
          TileCacheDB.saveRegion(region);
          return { offlineRegions: updated };
        });
      },

      deleteOfflineRegion: async (id) => {
        await TileCacheDB.deleteRegion(id);
        set((state) => ({
          offlineRegions: state.offlineRegions.filter((r) => r.id !== id),
        }));
      },

      setDownloadingState: (isDownloading, progress) => {
        set({
          isDownloadingRegion: isDownloading,
          downloadProgress: progress,
        });
      },

      setRoutes: (routes) => set({ routes }),

      addRoute: (route) =>
        set((state) => ({ routes: [route, ...state.routes] })),

      updateRoute: (id, updates) =>
        set((state) => ({
          routes: state.routes.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
          ),
        })),

      downloadRouteOffline: (routeId) =>
        set((state) => {
          if (state.offlineRouteIds.includes(routeId)) return state;
          const updatedRoutes = state.routes.map((r) =>
            r.id === routeId ? { ...r, isOfflineCached: true } : r
          );
          return {
            offlineRouteIds: [...state.offlineRouteIds, routeId],
            routes: updatedRoutes,
          };
        }),

      removeOfflineRoute: (routeId) =>
        set((state) => ({
          offlineRouteIds: state.offlineRouteIds.filter((id) => id !== routeId),
          routes: state.routes.map((r) =>
            r.id === routeId ? { ...r, isOfflineCached: false } : r
          ),
        })),

      syncRoutesWithFirestore: async () => {
        try {
          const remoteRoutes = await routeService.listPublishedRoutes();
          if (remoteRoutes && remoteRoutes.length > 0) {
            set((state) => {
              const localIds = new Set(state.routes.map((r) => r.id));
              const toAdd = remoteRoutes.filter((r) => !localIds.has(r.id));
              const merged = state.routes.map((lr) => {
                const remote = remoteRoutes.find((rr) => rr.id === lr.id);
                return remote ? { ...lr, ...remote } : lr;
              });
              return { routes: [...merged, ...toAdd] };
            });
          }
        } catch {
          // Graceful fallback to offline cached routes
        }
      },

      saveRouteToFirestore: async (route) => {
        set((s) => ({ routes: [route, ...s.routes.filter((r) => r.id !== route.id)] }));
        try {
          await routeService.createRoute(route);
        } catch {
          // Keep saved locally
        }
      },

      updateRouteInFirestore: async (id, updates) => {
        set((state) => ({
          routes: state.routes.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
          ),
        }));
        try {
          await routeService.updateRoute(id, updates);
        } catch {
          // Kept locally
        }
      },

      deleteRouteFromFirestore: async (id) => {
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id),
          offlineRouteIds: state.offlineRouteIds.filter((rid) => rid !== id),
        }));
        try {
          await routeService.deleteRoute(id);
        } catch {
          // Deleted locally
        }
      },

      // Draft Planning
      setDraftRoute: (draft) => set({ draftRoute: draft }),

      updateDraftPoints: (start, end) =>
        set((state) => ({
          draftRoute: {
            ...state.draftRoute,
            startPoint: start,
            endPoint: end,
            waypoints: [
              { lat: start.lat, lng: start.lng },
              { lat: end.lat, lng: end.lng },
            ],
            status: 'draft',
            createdAt: Date.now(),
          },
        })),

      confirmRealStart: (start) =>
        set((state) => {
          if (!state.draftRoute) return state;
          return {
            draftRoute: {
              ...state.draftRoute,
              startPoint: start,
            },
          };
        }),

      // GPS Recording
      startGpsRecording: (initialPoint, title = 'Nueva Ruta en Terreno', description = '') => {
        set({
          activeRecording: {
            isRecording: true,
            isPaused: false,
            title,
            description,
            region: 'Cordillera / Altiplano, Bolivia',
            startPoint: {
              name: 'Punto de Inicio Real',
              lat: initialPoint.lat,
              lng: initialPoint.lng,
            },
            endPoint: null,
            waypoints: [initialPoint],
            checkpoints: [],
            photos: [],
            startTime: Date.now(),
            elapsedSeconds: 0,
            accumulatedDistanceKm: 0,
          },
        });
      },

      pauseRecording: () =>
        set((state) => ({
          activeRecording: { ...state.activeRecording, isPaused: true },
        })),

      resumeRecording: () =>
        set((state) => ({
          activeRecording: { ...state.activeRecording, isPaused: false },
        })),

      addWaypointToRecording: (point) =>
        set((state) => {
          if (!state.activeRecording.isRecording || state.activeRecording.isPaused) return state;
          const updatedWaypoints = [...state.activeRecording.waypoints, point];
          const distance = calculateTrackDistanceKm(updatedWaypoints);
          return {
            activeRecording: {
              ...state.activeRecording,
              waypoints: updatedWaypoints,
              accumulatedDistanceKm: distance,
            },
          };
        }),

      addCheckpointToRecording: (checkpoint) =>
        set((state) => ({
          activeRecording: {
            ...state.activeRecording,
            checkpoints: [...state.activeRecording.checkpoints, checkpoint],
          },
        })),

      addPhotoToRecording: (photoUrl) =>
        set((state) => ({
          activeRecording: {
            ...state.activeRecording,
            photos: [...state.activeRecording.photos, photoUrl],
          },
        })),

      finishRecording: (creatorId, creatorName, finalPoint, isPrivate = false) => {
        const state = get();
        const rec = state.activeRecording;
        const finalWaypoints = [...rec.waypoints, { lat: finalPoint.lat, lng: finalPoint.lng }];
        const totalDistance = calculateTrackDistanceKm(finalWaypoints);
        const durationMin = Math.max(1, Math.round(rec.elapsedSeconds / 60));
        const difficulty = suggestRouteDifficulty(totalDistance, durationMin);

        const newRoute: RouteModel = {
          id: `route-${Date.now()}`,
          title: rec.title || 'Sendero Grabado en Bolivia',
          description:
            rec.description || 'Ruta registrada mediante GPS en terreno sin conexión permanente.',
          region: rec.region || 'Bolivia',
          startPoint: rec.startPoint || {
            name: 'Punto Inicial',
            lat: finalWaypoints[0]?.lat || -16.5,
            lng: finalWaypoints[0]?.lng || -68.1,
          },
          endPoint: finalPoint,
          distanceKm: totalDistance,
          durationMinutes: durationMin,
          difficulty,
          modality: totalDistance > 15 ? 'acompañado' : 'solo',
          status: isPrivate ? 'draft' : 'draft',
          isPrivate,
          creatorId,
          creatorName,
          waypoints: finalWaypoints,
          checkpoints: rec.checkpoints,
          photos: rec.photos.length > 0 ? rec.photos : [
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isOfflineCached: true,
          estimatedOfflineSizeMB: 10.2,
        };

        set((s) => ({
          routes: [newRoute, ...s.routes],
          activeRecording: initialRecording,
        }));

        // Asynchronously persist to Firestore via routeService
        routeService.createRoute(newRoute).catch((err) => {
          console.log('Saved route to local store; offline fallback active:', err);
        });

        return newRoute;
      },

      discardRecording: () => set({ activeRecording: initialRecording }),

      // Activity Tracking
      startActivityOnRoute: (route, startPos) => {
        const remaining = calculateRemainingDistanceKm(startPos, route.waypoints);
        set({
          activeActivity: {
            isActive: true,
            isPaused: false,
            routeId: route.id,
            routeTitle: route.title,
            officialWaypoints: route.waypoints,
            officialCheckpoints: route.checkpoints,
            currentPosition: startPos,
            distanceCoveredKm: 0,
            remainingDistanceKm: remaining,
            elapsedSeconds: 0,
            startTime: Date.now(),
            completedCheckpointIds: [],
          },
        });
      },

      updateActivityPosition: (pos) =>
        set((state) => {
          if (!state.activeActivity.isActive || state.activeActivity.isPaused) return state;
          const prevPos = state.activeActivity.currentPosition;
          let addedDistance = 0;
          if (prevPos) {
            const R = 6371;
            const dLat = ((pos.lat - prevPos.lat) * Math.PI) / 180;
            const dLon = ((pos.lng - prevPos.lng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((prevPos.lat * Math.PI) / 180) *
                Math.cos((pos.lat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            addedDistance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
          }
          const covered = Math.round((state.activeActivity.distanceCoveredKm + addedDistance) * 100) / 100;
          const remaining = calculateRemainingDistanceKm(pos, state.activeActivity.officialWaypoints);

          return {
            activeActivity: {
              ...state.activeActivity,
              currentPosition: pos,
              distanceCoveredKm: covered,
              remainingDistanceKm: remaining,
            },
          };
        }),

      toggleCheckpointCompleted: (checkpointId) =>
        set((state) => {
          const completed = state.activeActivity.completedCheckpointIds;
          const next = completed.includes(checkpointId)
            ? completed.filter((id) => id !== checkpointId)
            : [...completed, checkpointId];
          return {
            activeActivity: {
              ...state.activeActivity,
              completedCheckpointIds: next,
            },
          };
        }),

      pauseActivity: () =>
        set((state) => ({
          activeActivity: { ...state.activeActivity, isPaused: true },
        })),

      resumeActivity: () =>
        set((state) => ({
          activeActivity: { ...state.activeActivity, isPaused: false },
        })),

      finishActivity: (userId, userName, forceComplete = false) => {
        const state = get();
        const act = state.activeActivity;
        const isComplete = forceComplete || act.remainingDistanceKm < 0.4;

        const newActivityRecord: TrekkingActivity = {
          id: `act-${Date.now()}`,
          userId,
          userName,
          routeId: act.routeId,
          routeTitle: act.routeTitle,
          status: isComplete ? 'completed' : 'incomplete',
          startedAt: act.startTime || Date.now() - act.elapsedSeconds * 1000,
          finishedAt: Date.now(),
          distanceCoveredKm: act.distanceCoveredKm,
          remainingDistanceKm: act.remainingDistanceKm,
          durationSeconds: act.elapsedSeconds,
          recordedPoints: act.currentPosition ? [act.currentPosition] : [],
          completedCheckpoints: act.completedCheckpointIds,
          isSynced: !state.isOfflineMode,
          createdAt: Date.now(),
        };

        set((s) => ({
          activitiesHistory: [newActivityRecord, ...s.activitiesHistory],
          activeActivity: initialActivity,
        }));

        return newActivityRecord;
      },

      syncPendingActivities: () =>
        set((state) => ({
          activitiesHistory: state.activitiesHistory.map((a) => ({
            ...a,
            isSynced: true,
          })),
        })),

      toggleOfflineMode: (offline) =>
        set((state) => ({
          isOfflineMode: offline !== undefined ? offline : !state.isOfflineMode,
        })),

      // Users Management
      toggleUserBlocked: (uid) =>
        set((state) => ({
          usersList: state.usersList.map((u) =>
            u.uid === uid ? { ...u, isBlocked: !u.isBlocked } : u
          ),
        })),

      setUserRole: (uid, role) =>
        set((state) => ({
          usersList: state.usersList.map((u) =>
            u.uid === uid ? { ...u, role } : u
          ),
        })),

      // GPS Movement Simulation (moves recorded/activity coordinate incrementally)
      simulateGpsMovement: () => {
        const state = get();
        if (state.activeRecording.isRecording && !state.activeRecording.isPaused) {
          const lastPoint =
            state.activeRecording.waypoints[state.activeRecording.waypoints.length - 1] || {
              lat: -16.5385,
              lng: -67.8924,
            };
          // simulate step along Andes ridge
          const nextPoint: Coordinates = {
            lat: Number((lastPoint.lat + (Math.random() * 0.002 - 0.0005)).toFixed(5)),
            lng: Number((lastPoint.lng + (Math.random() * 0.002 - 0.0005)).toFixed(5)),
            altitude: (lastPoint.altitude || 4200) + Math.round(Math.random() * 10 - 4),
            timestamp: Date.now(),
          };
          const updatedWaypoints = [...state.activeRecording.waypoints, nextPoint];
          const dist = calculateTrackDistanceKm(updatedWaypoints);
          set({
            activeRecording: {
              ...state.activeRecording,
              waypoints: updatedWaypoints,
              elapsedSeconds: state.activeRecording.elapsedSeconds + 5,
              accumulatedDistanceKm: dist,
            },
          });
        }

        if (state.activeActivity.isActive && !state.activeActivity.isPaused) {
          const waypoints = state.activeActivity.officialWaypoints;
          if (waypoints.length > 0) {
            const currentIdx = Math.min(
              waypoints.length - 1,
              Math.floor((state.activeActivity.elapsedSeconds / 15) % waypoints.length)
            );
            const targetPoint = waypoints[currentIdx];
            const nextPoint: Coordinates = {
              lat: targetPoint.lat + (Math.random() * 0.0005 - 0.00025),
              lng: targetPoint.lng + (Math.random() * 0.0005 - 0.00025),
              altitude: targetPoint.altitude,
              timestamp: Date.now(),
            };
            const covered = Number(
              (
                state.activeActivity.distanceCoveredKm +
                calculateHaversineDistanceKm(
                  state.activeActivity.currentPosition?.lat || targetPoint.lat,
                  state.activeActivity.currentPosition?.lng || targetPoint.lng,
                  nextPoint.lat,
                  nextPoint.lng
                )
              ).toFixed(2)
            );
            const remaining = calculateRemainingDistanceKm(nextPoint, waypoints);

            set({
              activeActivity: {
                ...state.activeActivity,
                currentPosition: nextPoint,
                elapsedSeconds: state.activeActivity.elapsedSeconds + 5,
                distanceCoveredKm: covered,
                remainingDistanceKm: remaining,
              },
            });
          }
        }
      },
    }),
    {
      name: 'trekking-bolivia-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
