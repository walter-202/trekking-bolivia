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
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { TrekkingActivity } from '../../core/domain/types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

const ACTIVITIES_COLLECTION = 'activities';

export const activityService = {
  /**
   * Saves or syncs an activity to Firestore.
   */
  async saveActivity(activity: TrekkingActivity): Promise<void> {
    const docPath = `${ACTIVITIES_COLLECTION}/${activity.id}`;
    try {
      const docRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
      await setDoc(docRef, activity);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Retrieves a single activity by ID.
   */
  async getActivityById(id: string): Promise<TrekkingActivity | null> {
    const docPath = `${ACTIVITIES_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, ACTIVITIES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data() as TrekkingActivity;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  },

  /**
   * Fetches activities belonging to a user.
   */
  async getUserActivities(userId: string): Promise<TrekkingActivity[]> {
    const collectionPath = ACTIVITIES_COLLECTION;
    try {
      const q = query(
        collection(db, collectionPath),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map((d) => d.data() as TrekkingActivity);
      return activities.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  },

  /**
   * Subscribes to real-time updates of a user's activities.
   */
  subscribeToUserActivities(
    userId: string,
    onUpdate: (activities: TrekkingActivity[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const collectionPath = ACTIVITIES_COLLECTION;
    const q = query(
      collection(db, collectionPath),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const activities = snapshot.docs.map((d) => d.data() as TrekkingActivity);
        activities.sort((a, b) => b.createdAt - a.createdAt);
        onUpdate(activities);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      }
    );
  },
};
