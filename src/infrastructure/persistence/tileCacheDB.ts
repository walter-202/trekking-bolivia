/**
 * Service for caching Map Tiles (OSM and OpenTopoMap) in IndexedDB
 * for offline navigation in the Trekking Bolivia app (RNF-01 compatibility).
 * Fully guarded for Expo / React Native environments where indexedDB is undefined.
 */

import { appStorage } from './storage';

const DB_NAME = 'TrekkingTileCacheDB';
const DB_VERSION = 1;
const TILE_STORE_NAME = 'tiles';
const REGION_STORE_NAME = 'regions';

export interface OfflineRegion {
  id: string;
  name: string;
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  minZoom: number;
  maxZoom: number;
  tileCount: number;
  downloadedCount: number;
  status: 'downloading' | 'completed' | 'failed';
  createdAt: number;
  sizeBytes: number;
}

export class TileCacheDB {
  private static db: IDBDatabase | null = null;

  private static getDB(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') {
      return Promise.resolve(null);
    }
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('No se pudo abrir la base de datos de tiles IndexedDB'));
      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Tile cache store (key format: "provider/zoom/x/y")
        if (!db.objectStoreNames.contains(TILE_STORE_NAME)) {
          db.createObjectStore(TILE_STORE_NAME, { keyPath: 'key' });
        }

        // Offline Regions metadata
        if (!db.objectStoreNames.contains(REGION_STORE_NAME)) {
          db.createObjectStore(REGION_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  // --- Tile Operations ---

  public static async getTile(key: string): Promise<Blob | null> {
    try {
      const db = await this.getDB();
      if (!db) return null;

      return new Promise((resolve) => {
        const transaction = db.transaction(TILE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(TILE_STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.blob);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          resolve(null);
        };
      });
    } catch (e) {
      console.error('Error al obtener tile de IndexedDB:', e);
      return null;
    }
  }

  public static async saveTile(key: string, blob: Blob): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(TILE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(TILE_STORE_NAME);
        const request = store.put({ key, blob, createdAt: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Error al guardar tile en IndexedDB:', e);
    }
  }

  public static async deleteTilesForRegionKeys(keys: string[]): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(TILE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(TILE_STORE_NAME);
        
        let completed = 0;
        let hasError = false;

        if (keys.length === 0) {
          resolve();
          return;
        }

        keys.forEach((key) => {
          const request = store.delete(key);
          request.onsuccess = () => {
            completed++;
            if (completed === keys.length && !hasError) {
              resolve();
            }
          };
          request.onerror = () => {
            hasError = true;
            reject(request.error);
          };
        });
      });
    } catch (e) {
      console.error('Error al borrar tiles de región:', e);
    }
  }

  public static async clearAllTiles(): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([TILE_STORE_NAME, REGION_STORE_NAME], 'readwrite');
        const tileStore = transaction.objectStore(TILE_STORE_NAME);
        const regionStore = transaction.objectStore(REGION_STORE_NAME);
        
        tileStore.clear();
        regionStore.clear();

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error('Error al vaciar IndexedDB:', e);
    }
  }

  public static async calculateTotalCacheSize(): Promise<{ sizeMB: number; tileCount: number }> {
    try {
      const db = await this.getDB();
      if (!db) return { sizeMB: 0, tileCount: 0 };

      return new Promise((resolve) => {
        const transaction = db.transaction(TILE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(TILE_STORE_NAME);
        const request = store.openCursor();
        
        let totalBytes = 0;
        let count = 0;

        request.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            count++;
            const value = cursor.value;
            if (value.blob) {
              totalBytes += value.blob.size;
            }
            cursor.continue();
          } else {
            const sizeMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
            resolve({ sizeMB, tileCount: count });
          }
        };

        request.onerror = () => {
          resolve({ sizeMB: 0, tileCount: 0 });
        };
      });
    } catch (e) {
      return { sizeMB: 0, tileCount: 0 };
    }
  }

  public static async calculateDetailedStorageStats(): Promise<{
    totalSizeMB: number;
    totalCount: number;
    byProvider: {
      osmSizeMB: number;
      osmCount: number;
      topoSizeMB: number;
      topoCount: number;
    };
    byZoom: { zoom: number; sizeMB: number; count: number }[];
  }> {
    try {
      const db = await this.getDB();
      if (!db) {
        return {
          totalSizeMB: 0,
          totalCount: 0,
          byProvider: { osmSizeMB: 0, osmCount: 0, topoSizeMB: 0, topoCount: 0 },
          byZoom: [],
        };
      }

      return new Promise((resolve) => {
        const transaction = db.transaction(TILE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(TILE_STORE_NAME);
        const request = store.openCursor();
        
        let totalBytes = 0;
        let count = 0;

        let osmBytes = 0;
        let osmCount = 0;
        let topoBytes = 0;
        let topoCount = 0;

        const zoomMap: { [zoom: number]: { bytes: number; count: number } } = {};

        request.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            count++;
            const value = cursor.value;
            const size = value.blob ? value.blob.size : 0;
            totalBytes += size;

            // Key prefix check: "topo/", "streets/", "sat/", "opentopo/"
            const key: string = value.key || '';
            const parts = key.split('/');
            
            const isStreets = parts[0] === 'streets' || parts[0] === 'osm';
            const isTopo = parts[0] === 'topo' || parts[0] === 'opentopo' || parts[0] === 'sat' || parts[0] === 'natgeo';
            const zoom = parts[1] ? parseInt(parts[1], 10) : null;

            if (isStreets) {
              osmBytes += size;
              osmCount++;
            } else if (isTopo) {
              topoBytes += size;
              topoCount++;
            }

            if (zoom !== null && !isNaN(zoom)) {
              if (!zoomMap[zoom]) {
                zoomMap[zoom] = { bytes: 0, count: 0 };
              }
              zoomMap[zoom].bytes += size;
              zoomMap[zoom].count++;
            }

            cursor.continue();
          } else {
            const totalSizeMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
            const osmSizeMB = Number((osmBytes / (1024 * 1024)).toFixed(2));
            const topoSizeMB = Number((topoBytes / (1024 * 1024)).toFixed(2));

            const byZoom = Object.keys(zoomMap).map((zStr) => {
              const z = parseInt(zStr, 10);
              return {
                zoom: z,
                sizeMB: Number((zoomMap[z].bytes / (1024 * 1024)).toFixed(2)),
                count: zoomMap[z].count,
              };
            }).sort((a, b) => a.zoom - b.zoom);

            resolve({
              totalSizeMB,
              totalCount: count,
              byProvider: {
                osmSizeMB,
                osmCount,
                topoSizeMB,
                topoCount,
              },
              byZoom,
            });
          }
        };

        request.onerror = () => {
          resolve({
            totalSizeMB: 0,
            totalCount: 0,
            byProvider: { osmSizeMB: 0, osmCount: 0, topoSizeMB: 0, topoCount: 0 },
            byZoom: [],
          });
        };
      });
    } catch (e) {
      return {
        totalSizeMB: 0,
        totalCount: 0,
        byProvider: { osmSizeMB: 0, osmCount: 0, topoSizeMB: 0, topoCount: 0 },
        byZoom: [],
      };
    }
  }

  // --- Region Operations ---

  public static async getRegions(): Promise<OfflineRegion[]> {
    try {
      const db = await this.getDB();
      if (!db) {
        const raw = await appStorage.getItem('offline_regions');
        return raw ? JSON.parse(raw) : [];
      }

      return new Promise((resolve) => {
        const transaction = db.transaction(REGION_STORE_NAME, 'readonly');
        const store = transaction.objectStore(REGION_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    } catch (e) {
      return [];
    }
  }

  public static async saveRegion(region: OfflineRegion): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) {
        const regions = await this.getRegions();
        const updated = regions.filter((r) => r.id !== region.id).concat(region);
        await appStorage.setItem('offline_regions', JSON.stringify(updated));
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(REGION_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(REGION_STORE_NAME);
        const request = store.put(region);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Error al guardar región:', e);
    }
  }

  public static async deleteRegion(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) {
        const regions = await this.getRegions();
        const updated = regions.filter((r) => r.id !== id);
        await appStorage.setItem('offline_regions', JSON.stringify(updated));
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(REGION_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(REGION_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Error al borrar región:', e);
    }
  }
}
