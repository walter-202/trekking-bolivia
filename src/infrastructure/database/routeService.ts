import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { RouteModel, RouteStatus } from '../../core/domain/types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

const ROUTES_COLLECTION = 'routes';

export const routeService = {
  /**
   * Fetches a route by ID.
   */
  async getRouteById(id: string): Promise<RouteModel | null> {
    const docPath = `${ROUTES_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, ROUTES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return null;
      }
      return snapshot.data() as RouteModel;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  },

  /**
   * Creates a new route in Firestore (draft or in_review).
   */
  async createRoute(route: RouteModel): Promise<void> {
    const docPath = `${ROUTES_COLLECTION}/${route.id}`;
    try {
      const docRef = doc(db, ROUTES_COLLECTION, route.id);
      const now = Date.now();
      const payload: RouteModel = {
        ...route,
        createdAt: route.createdAt || now,
        updatedAt: route.updatedAt || now,
      };
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  /**
   * Updates an existing route.
   */
  async updateRoute(id: string, updates: Partial<RouteModel>): Promise<void> {
    const docPath = `${ROUTES_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, ROUTES_COLLECTION, id);
      const cleanUpdates = Object.entries({
        ...updates,
        updatedAt: Date.now(),
      }).reduce<Record<string, any>>((acc, [key, val]) => {
        if (val !== undefined) acc[key] = val;
        return acc;
      }, {});

      await updateDoc(docRef, cleanUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  /**
   * Deletes a route (Creator if draft, or Admin).
   */
  async deleteRoute(id: string): Promise<void> {
    const docPath = `${ROUTES_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, ROUTES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  /**
   * Lists published routes from Firestore with optional filtering.
   */
  async listPublishedRoutes(filters?: {
    region?: string;
    difficulty?: string;
    maxResults?: number;
  }): Promise<RouteModel[]> {
    const collectionPath = ROUTES_COLLECTION;
    try {
      const baseQuery = query(
        collection(db, collectionPath),
        where('status', '==', 'published'),
        limit(filters?.maxResults || 100)
      );

      const snapshot = await getDocs(baseQuery);
      let results = snapshot.docs.map((d) => d.data() as RouteModel);

      if (filters?.region && filters.region !== 'todas') {
        results = results.filter((r) => r.region.toLowerCase().includes(filters.region!.toLowerCase()));
      }
      if (filters?.difficulty && filters.difficulty !== 'todas') {
        results = results.filter((r) => r.difficulty === filters.difficulty);
      }

      return results;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  },

  /**
   * Lists all routes created by a specific user.
   */
  async listUserRoutes(creatorId: string): Promise<RouteModel[]> {
    const collectionPath = ROUTES_COLLECTION;
    try {
      const q = query(
        collection(db, collectionPath),
        where('creatorId', '==', creatorId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as RouteModel);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  },

  /**
   * Lists routes pending moderation (in_review).
   */
  async listRoutesPendingReview(): Promise<RouteModel[]> {
    const collectionPath = ROUTES_COLLECTION;
    try {
      const q = query(
        collection(db, collectionPath),
        where('status', '==', 'in_review')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as RouteModel);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  },

  /**
   * Real-time listener for published catalog routes.
   */
  subscribeToPublishedRoutes(
    onUpdate: (routes: RouteModel[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const collectionPath = ROUTES_COLLECTION;
    const q = query(collection(db, collectionPath), where('status', '==', 'published'));

    return onSnapshot(
      q,
      (snapshot) => {
        const routes = snapshot.docs.map((d) => d.data() as RouteModel);
        onUpdate(routes);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      }
    );
  },

  /**
   * Real-time listener for a single route document.
   */
  subscribeToRoute(
    id: string,
    onUpdate: (route: RouteModel | null) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const docPath = `${ROUTES_COLLECTION}/${id}`;
    const docRef = doc(db, ROUTES_COLLECTION, id);

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          onUpdate(null);
        } else {
          onUpdate(snapshot.data() as RouteModel);
        }
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, docPath);
      }
    );
  },
};
