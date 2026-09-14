import { userProfileService } from './userProfileService';
import { routeService } from './routeService';
import { activityService } from './activityService';
import { handleFirestoreError, OperationType, FirestoreErrorInfo } from './firestoreErrors';

export { userProfileService } from './userProfileService';
export { routeService } from './routeService';
export { activityService } from './activityService';
export { handleFirestoreError, OperationType };
export type { FirestoreErrorInfo };

/**
 * Unified modular database service for Trekking Bolivia
 */
export const databaseService = {
  users: userProfileService,
  routes: routeService,
  activities: activityService,
};

export default databaseService;
