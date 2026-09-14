import { TileCacheDB, OfflineRegion } from './tileCacheDB';

// Slippy map tile formulas
export function latLngToTileXY(lat: number, lng: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export function tileXYToLatLng(x: number, y: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lng = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const lat = (latRad * 180) / Math.PI;
  return { lat, lng };
}

export interface TileCoordinate {
  z: number;
  x: number;
  y: number;
  key: string;
  url: string;
}

/**
 * Calculates the complete list of tile coordinates within a bounding box and zoom levels.
 */
export function calculateTilesInBounds(
  bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  minZoom: number,
  maxZoom: number,
  provider: 'topo' | 'streets' | 'sat' | 'opentopo' = 'topo'
): TileCoordinate[] {
  const tiles: TileCoordinate[] = [];

  for (let z = minZoom; z <= maxZoom; z++) {
    const tl = latLngToTileXY(bounds.maxLat, bounds.minLng, z); // Top-left is maxLat, minLng
    const br = latLngToTileXY(bounds.minLat, bounds.maxLng, z); // Bottom-right is minLat, maxLng

    const xMin = Math.max(0, Math.min(tl.x, br.x));
    const xMax = Math.max(0, Math.max(tl.x, br.x));
    const yMin = Math.max(0, Math.min(tl.y, br.y));
    const yMax = Math.max(0, Math.max(tl.y, br.y));

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const key = `${provider}/${z}/${x}/${y}`;
        let url = '';
        if (provider === 'topo') {
          // Esri World Topographic Map (100% Free, contours & terrain shading)
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`;
        } else if (provider === 'streets') {
          // Esri World Street Map (100% Free, trails and access)
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
        } else if (provider === 'sat') {
          // Esri World Imagery (100% Free, satellite photography)
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
        } else {
          // OpenTopoMap server random subdomains a, b, c
          const sub = ['a', 'b', 'c'][Math.floor(Math.random() * 3)];
          url = `https://${sub}.tile.opentopomap.org/${z}/${x}/${y}.png`;
        }

        tiles.push({ z, x, y, key, url });
      }
    }
  }

  return tiles;
}

/**
 * Download tiles in parallel batches (throttled to protect system and servers).
 */
export async function downloadTiles(
  tiles: TileCoordinate[],
  onProgress: (downloaded: number, total: number, sizeBytes: number) => void,
  signal?: AbortSignal
): Promise<{ downloadedCount: number; sizeBytes: number; failedCount: number }> {
  let downloadedCount = 0;
  let failedCount = 0;
  let totalBytes = 0;
  const total = tiles.length;

  const CONCURRENCY = 4; // Max 4 concurrent tile downloads

  const downloadQueue = [...tiles];

  const workers = Array(CONCURRENCY)
    .fill(null)
    .map(async () => {
      while (downloadQueue.length > 0) {
        if (signal?.aborted) {
          throw new Error('Descarga cancelada por el usuario');
        }

        const tile = downloadQueue.shift();
        if (!tile) break;

        try {
          // Fetch the tile image as a Blob
          const response = await fetch(tile.url, {
            method: 'GET',
            referrerPolicy: 'no-referrer',
            signal,
          });

          if (!response.ok) {
            throw new Error(`Tile HTTP Error ${response.status}`);
          }

          const blob = await response.blob();
          
          // Verify it is an image
          if (blob.type.startsWith('image/')) {
            await TileCacheDB.saveTile(tile.key, blob);
            totalBytes += blob.size;
            downloadedCount++;
          } else {
            throw new Error('Respuesta inválida (no es una imagen)');
          }
        } catch (e) {
          console.warn(`Error al descargar tile ${tile.key}:`, e);
          failedCount++;
        }

        onProgress(downloadedCount + failedCount, total, totalBytes);
      }
    });

  await Promise.all(workers);

  return { downloadedCount, sizeBytes: totalBytes, failedCount };
}
