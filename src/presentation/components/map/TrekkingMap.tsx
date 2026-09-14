import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, Checkpoint } from '../../../core/domain/types';
import { TileCacheDB } from '../../../infrastructure/persistence/tileCacheDB';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';

interface TrekkingMapProps {
  center?: [number, number];
  zoom?: number;
  waypoints?: Coordinates[];
  checkpoints?: Checkpoint[];
  currentPosition?: Coordinates | null;
  recordedTrack?: Coordinates[];
  startPoint?: { name: string; lat: number; lng: number } | null;
  endPoint?: { name: string; lat: number; lng: number } | null;
  interactive?: boolean;
  className?: string;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  isSelectingRegion?: boolean;
  onSelectionBoundsChange?: (bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number }) => void;
}

const createOfflineTileLayer = (
  urlTemplate: string,
  options: any,
  provider: 'topo' | 'streets' | 'sat' | 'natgeo' | 'opentopo'
) => {
  const OfflineTileLayerClass = L.TileLayer.extend({
    createTile: function (this: any, coords: any, done: any) {
      const tile = document.createElement('img');
      tile.crossOrigin = 'anonymous';
      const key = `${provider}/${coords.z}/${coords.x}/${coords.y}`;

      L.DomEvent.on(tile, 'load', () => done(null, tile));
      L.DomEvent.on(tile, 'error', (err: any) => done(err, tile));

      TileCacheDB.getTile(key)
        .then((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            tile.src = url;
            tile.onload = () => {
              done(null, tile);
              setTimeout(() => {
                if (tile.src.startsWith('blob:')) {
                  URL.revokeObjectURL(tile.src);
                }
              }, 100);
            };
          } else {
            const isOffline = useTrekkingStore.getState().isOfflineMode;
            if (isOffline) {
              tile.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" style="background-color:%23051712;"><rect width="256" height="256" fill="%23051712"/><path d="M128 80v60M128 168h.01" stroke="%2310b981" stroke-width="4" stroke-linecap="round"/><text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%2334d399" font-weight="bold">Modo Offline</text><text x="50%" y="92%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="9" fill="%236ee7b7">Sector no descargado</text></svg>';
            } else {
              const tileUrl = this.getTileUrl(coords);
              fetch(tileUrl, { mode: 'cors' })
                .then((res) => {
                  if (!res.ok) throw new Error('HTTP ' + res.status);
                  return res.blob();
                })
                .then((fetchedBlob) => {
                  TileCacheDB.saveTile(key, fetchedBlob);
                  const url = URL.createObjectURL(fetchedBlob);
                  tile.src = url;
                })
                .catch(() => {
                  // Direct image load fallback
                  tile.src = tileUrl;
                });
            }
          }
        })
        .catch(() => {
          tile.src = this.getTileUrl(coords);
        });

      return tile;
    },
  });

  return new (OfflineTileLayerClass as any)(urlTemplate, options);
};

export const TrekkingMap: React.FC<TrekkingMapProps> = ({
  center = [-16.5385, -67.8924], // Default to Takesi / Mururata
  zoom = 12,
  waypoints = [],
  checkpoints = [],
  currentPosition = null,
  recordedTrack = [],
  startPoint = null,
  endPoint = null,
  interactive = true,
  className = 'h-72 w-full',
  onMapClick,
  isSelectingRegion = false,
  onSelectionBoundsChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center as L.LatLngExpression,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: false,
      });

      // Esri World Topo Map: Topographic contours, relief shading & elevation for Cordillera Real & Yungas (100% Free)
      const esriTopo = createOfflineTileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri &mdash; National Geographic, USGS',
        },
        'topo'
      );

      // Esri World Street Map: Clean trails, roads, mountain access points (100% Free)
      const esriStreets = createOfflineTileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri &mdash; HERE, DeLorme, USGS',
        },
        'streets'
      );

      // Esri World Imagery: High-resolution satellite reconnaissance (100% Free)
      const esriSat = createOfflineTileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
        },
        'sat'
      );

      // Esri NatGeo Topo: Classic National Geographic mountain cartography (100% Free)
      const esriNatGeo = createOfflineTileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
          attribution: 'Tiles &copy; Esri, National Geographic',
        },
        'natgeo'
      );

      // OpenTopoMap: Community contour lines and topography (100% Free)
      const openTopo = createOfflineTileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 17,
          attribution: 'Map style: &copy; OpenTopoMap (CC-BY-SA)',
        },
        'opentopo'
      );

      // Default to Esri World Topo Map (Topographic mountain contours, clean, reliable, 100% free)
      esriTopo.addTo(map);

      // Add layer control for quick switching
      L.control
        .layers(
          {
            'Topográfico Montaña (Esri)': esriTopo,
            'Senderos y Accesos (Esri)': esriStreets,
            'Satélite Natural (Esri)': esriSat,
            'Topográfico Físico (NatGeo)': esriNatGeo,
            'Curvas de Nivel (OpenTopo)': openTopo,
          },
          {},
          { position: 'topright' }
        )
        .addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      if (onMapClick) {
        map.on('click', (e: any) => {
          onMapClick({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) });
        });
      }
    }

    return () => {
      // Keep map alive during tabs to prevent re-initialization flickers
    };
  }, []);

  // Update vectors, tracks, and markers when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Draw Official Route Track (Polyline)
    if (waypoints.length > 1) {
      const latlngs: [number, number][] = waypoints.map((p) => [p.lat, p.lng]);
      const polyline = L.polyline(latlngs, {
        color: '#047857', // emerald-700
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(layers);

      // Auto-fit bounds if we have waypoints
      try {
        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
      } catch {
        // Safe ignore
      }
    }

    // 2. Draw Live Recorded GPS Track (Amber line)
    if (recordedTrack.length > 1) {
      const liveLatLngs: [number, number][] = recordedTrack.map((p) => [p.lat, p.lng]);
      L.polyline(liveLatLngs, {
        color: '#d97706', // amber-600
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.9,
      }).addTo(layers);
    }

    // Custom Icon Generator using SVG
    const createSvgMarker = (color: string, letter: string, title: string) =>
      L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: pointer;" title="${title}">${letter}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

    // 3. Start Point Marker
    if (startPoint) {
      L.marker([startPoint.lat, startPoint.lng], {
        icon: createSvgMarker('#059669', 'IN', `Inicio: ${startPoint.name}`),
      })
        .bindPopup(`<b>Inicio:</b> ${startPoint.name}`)
        .addTo(layers);
    } else if (waypoints.length > 0) {
      const first = waypoints[0];
      L.marker([first.lat, first.lng], {
        icon: createSvgMarker('#059669', 'IN', 'Punto Inicial'),
      })
        .bindPopup('<b>Inicio de la Ruta</b>')
        .addTo(layers);
    }

    // 4. End Point Marker
    if (endPoint) {
      L.marker([endPoint.lat, endPoint.lng], {
        icon: createSvgMarker('#dc2626', 'FIN', `Final: ${endPoint.name}`),
      })
        .bindPopup(`<b>Destino:</b> ${endPoint.name}`)
        .addTo(layers);
    } else if (waypoints.length > 1) {
      const last = waypoints[waypoints.length - 1];
      L.marker([last.lat, last.lng], {
        icon: createSvgMarker('#dc2626', 'FIN', 'Punto de Destino'),
      })
        .bindPopup('<b>Llegada / Destino Final</b>')
        .addTo(layers);
    }

    // 5. Checkpoints (water, camping, danger, view, rest)
    checkpoints.forEach((cp) => {
      let color = '#2563eb';
      let iconChar = '•';

      switch (cp.category) {
        case 'agua':
          color = '#0284c7';
          iconChar = '💧';
          break;
        case 'camping':
          color = '#16a34a';
          iconChar = '⛺';
          break;
        case 'peligro':
          color = '#ea580c';
          iconChar = '⚠️';
          break;
        case 'vista':
          color = '#9333ea';
          iconChar = '📷';
          break;
        case 'descanso':
          color = '#4b5563';
          iconChar = '🛑';
          break;
        case 'refugio':
          color = '#b45309';
          iconChar = '🏠';
          break;
      }

      const cpMarker = L.marker([cp.lat, cp.lng], {
        icon: L.divIcon({
          className: 'cp-marker',
          html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${iconChar}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
      });

      cpMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <b style="font-size: 13px; color: #1c1917;">${cp.name}</b><br/>
          <span style="color: #78716c; text-transform: uppercase; font-size: 10px;">${cp.category}</span>
          ${cp.notes ? `<p style="margin: 4px 0 0 0; color: #44403c;">${cp.notes}</p>` : ''}
        </div>
      `);
      cpMarker.addTo(layers);
    });

    // 6. Current User Position (Pulsing marker)
    if (currentPosition) {
      const posMarker = L.circleMarker([currentPosition.lat, currentPosition.lng], {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      });
      posMarker.bindPopup('<b>Tu ubicación actual</b>').addTo(layers);

      // Halo
      L.circle([currentPosition.lat, currentPosition.lng], {
        radius: 40,
        fillColor: '#60a5fa',
        fillOpacity: 0.25,
        stroke: false,
      }).addTo(layers);
    }
  }, [waypoints, checkpoints, currentPosition, recordedTrack, startPoint, endPoint]);

  const selectionRectangleRef = useRef<L.Rectangle | null>(null);

  // Update selection box if selecting region
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isSelectingRegion) {
      const updateSelectionBounds = () => {
        const bounds = map.getBounds();
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();

        // Calculate a nice subset (e.g. inner 60% of viewport)
        const latDelta = (northEast.lat - southWest.lat) * 0.2;
        const lngDelta = (northEast.lng - southWest.lng) * 0.2;

        const selectionBounds = L.latLngBounds(
          [southWest.lat + latDelta, southWest.lng + lngDelta],
          [northEast.lat - latDelta, northEast.lng - lngDelta]
        );

        if (selectionRectangleRef.current) {
          selectionRectangleRef.current.setBounds(selectionBounds);
        } else {
          selectionRectangleRef.current = L.rectangle(selectionBounds, {
            color: '#047857', // emerald-700
            weight: 2.5,
            fillColor: '#10b981', // emerald-500
            fillOpacity: 0.18,
            dashArray: '6, 6',
          }).addTo(map);
        }

        if (onSelectionBoundsChange) {
          onSelectionBoundsChange({
            minLat: Number(selectionBounds.getSouth().toFixed(5)),
            minLng: Number(selectionBounds.getWest().toFixed(5)),
            maxLat: Number(selectionBounds.getNorth().toFixed(5)),
            maxLng: Number(selectionBounds.getEast().toFixed(5)),
          });
        }
      };

      // Delay slightly to allow map coordinates/sizes to initialize completely
      const timeoutId = setTimeout(updateSelectionBounds, 100);

      // Listen to map events to update box as user moves
      map.on('move', updateSelectionBounds);
      map.on('zoomend', updateSelectionBounds);

      return () => {
        clearTimeout(timeoutId);
        map.off('move', updateSelectionBounds);
        map.off('zoomend', updateSelectionBounds);
        if (selectionRectangleRef.current) {
          selectionRectangleRef.current.remove();
          selectionRectangleRef.current = null;
        }
      };
    } else {
      if (selectionRectangleRef.current) {
        selectionRectangleRef.current.remove();
        selectionRectangleRef.current = null;
      }
    }
  }, [isSelectingRegion, onSelectionBoundsChange]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
      <div ref={mapContainerRef} className={className} />
      <div className="absolute top-2 left-2 z-400 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-700 shadow-xs border border-stone-200/80 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Cartografía Topográfica & Satelital (100% Gratuita)
      </div>
    </div>
  );
};
