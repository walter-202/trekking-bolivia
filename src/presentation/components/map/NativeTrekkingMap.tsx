import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Rect,
  Path,
  Line,
  Circle,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Coordinates, Checkpoint } from '../../../core/domain/types';
import { AndeanTheme } from '../../theme';
import { Compass, Mountain } from 'lucide-react-native';

interface NativeTrekkingMapProps {
  center?: [number, number];
  zoom?: number;
  waypoints?: Coordinates[];
  checkpoints?: Checkpoint[];
  currentPosition?: Coordinates | null;
  recordedTrack?: Coordinates[];
  startPoint?: { name: string; lat: number; lng: number } | null;
  endPoint?: { name: string; lat: number; lng: number } | null;
  height?: number;
  title?: string;
}

export const NativeTrekkingMap: React.FC<NativeTrekkingMapProps> = ({
  waypoints = [],
  checkpoints = [],
  currentPosition = null,
  recordedTrack = [],
  startPoint = null,
  endPoint = null,
  height = 240,
  title = 'Cartografía Topográfica Andina',
}) => {
  const screenWidth = Dimensions.get('window').width - 32;
  const svgWidth = Math.max(screenWidth, 300);
  const svgHeight = height;

  // Compute bounding box
  const allPoints: Coordinates[] = [...waypoints, ...recordedTrack];
  if (currentPosition) allPoints.push(currentPosition);
  if (startPoint) allPoints.push({ lat: startPoint.lat, lng: startPoint.lng });
  if (endPoint) allPoints.push({ lat: endPoint.lat, lng: endPoint.lng });

  const minLat = allPoints.length > 0 ? Math.min(...allPoints.map((p) => p.lat)) : -16.55;
  const maxLat = allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.lat)) : -16.50;
  const minLng = allPoints.length > 0 ? Math.min(...allPoints.map((p) => p.lng)) : -67.95;
  const maxLng = allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.lng)) : -67.85;

  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lngSpan = Math.max(maxLng - minLng, 0.01);

  const padding = 35;
  const project = (coords: Coordinates) => {
    const x = padding + ((coords.lng - minLng) / lngSpan) * (svgWidth - padding * 2);
    // Invert latitude for screen Y coordinates
    const y = padding + ((maxLat - coords.lat) / latSpan) * (svgHeight - padding * 2);
    return { x, y };
  };

  // Build SVG path for waypoints
  let routePath = '';
  if (waypoints.length > 1) {
    waypoints.forEach((pt, idx) => {
      const p = project(pt);
      if (idx === 0) routePath += `M ${p.x} ${p.y}`;
      else routePath += ` L ${p.x} ${p.y}`;
    });
  }

  // Build SVG path for recorded track
  let trackPath = '';
  if (recordedTrack.length > 1) {
    recordedTrack.forEach((pt, idx) => {
      const p = project(pt);
      if (idx === 0) trackPath += `M ${p.x} ${p.y}`;
      else trackPath += ` L ${p.x} ${p.y}`;
    });
  }

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
        <Defs>
          <LinearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
            <Stop offset="100%" stopColor="#34D399" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Tactical Dark Background */}
        <Rect width={svgWidth} height={svgHeight} fill="#051712" rx={14} />

        {/* Contour elevation grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
          <G key={`contour-${idx}`}>
            <Line
              x1={0}
              y1={svgHeight * ratio}
              x2={svgWidth}
              y2={svgHeight * ratio}
              stroke="#0D3528"
              strokeWidth="1"
              strokeDasharray="4, 4"
            />
            <Line
              x1={svgWidth * ratio}
              y1={0}
              x2={svgWidth * ratio}
              y2={svgHeight}
              stroke="#0D3528"
              strokeWidth="1"
              strokeDasharray="4, 4"
            />
          </G>
        ))}

        {/* Topographic Relief Waves */}
        <Path
          d={`M 0 ${svgHeight * 0.75} Q ${svgWidth * 0.25} ${svgHeight * 0.65} ${svgWidth * 0.5} ${svgHeight * 0.72} T ${svgWidth} ${svgHeight * 0.6} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
          fill="#08291F"
          opacity={0.4}
        />
        <Path
          d={`M 0 ${svgHeight * 0.85} Q ${svgWidth * 0.35} ${svgHeight * 0.78} ${svgWidth * 0.7} ${svgHeight * 0.82} T ${svgWidth} ${svgHeight * 0.75} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
          fill="#0C3B2D"
          opacity={0.5}
        />

        {/* Planned Route Line */}
        {routePath ? (
          <>
            {/* Outer Glow */}
            <Path
              d={routePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="6"
              strokeOpacity={0.25}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main Path */}
            <Path
              d={routePath}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}

        {/* Live Track Path */}
        {trackPath ? (
          <Path
            d={trackPath}
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth="3"
            strokeDasharray="5, 3"
            strokeLinecap="round"
          />
        ) : null}

        {/* Checkpoint Pins */}
        {checkpoints.map((cp, idx) => {
          const pt = project({ lat: cp.lat, lng: cp.lng });
          return (
            <G key={`cp-${idx}`}>
              <Circle cx={pt.x} cy={pt.y} r={6} fill="#10B981" stroke="#051712" strokeWidth={2} />
              <Circle cx={pt.x} cy={pt.y} r={2} fill="#FFFFFF" />
              <SvgText
                x={pt.x}
                y={pt.y - 10}
                fill="#A7F3D0"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {cp.name.length > 14 ? `${cp.name.slice(0, 12)}..` : cp.name}
              </SvgText>
            </G>
          );
        })}

        {/* Start Point */}
        {startPoint ? (
          (() => {
            const pt = project({ lat: startPoint.lat, lng: startPoint.lng });
            return (
              <G>
                <Circle cx={pt.x} cy={pt.y} r={7} fill="#10B981" stroke="#FFFFFF" strokeWidth={2} />
                <SvgText x={pt.x} y={pt.y + 16} fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Inicio
                </SvgText>
              </G>
            );
          })()
        ) : null}

        {/* End Point */}
        {endPoint ? (
          (() => {
            const pt = project({ lat: endPoint.lat, lng: endPoint.lng });
            return (
              <G>
                <Circle cx={pt.x} cy={pt.y} r={7} fill="#D97706" stroke="#FFFFFF" strokeWidth={2} />
                <SvgText x={pt.x} y={pt.y + 16} fill="#FBBF24" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Cumbre/Fin
                </SvgText>
              </G>
            );
          })()
        ) : null}

        {/* Current Position Marker with Radar Pulse */}
        {currentPosition ? (
          (() => {
            const pt = project(currentPosition);
            return (
              <G>
                <Circle cx={pt.x} cy={pt.y} r={16} fill="#10B981" fillOpacity={0.2} />
                <Circle cx={pt.x} cy={pt.y} r={10} fill="#10B981" fillOpacity={0.4} />
                <Circle cx={pt.x} cy={pt.y} r={5} fill="#34D399" stroke="#FFFFFF" strokeWidth={2} />
              </G>
            );
          })()
        ) : null}
      </Svg>

      {/* Tactical HUD Overlay Info */}
      <View style={styles.hudBadge}>
        <View style={styles.pulseDot} />
        <Text style={styles.hudText}>{title}</Text>
      </View>

      <View style={styles.coordsBadge}>
        <Compass size={11} color="#34D399" />
        <Text style={styles.coordsText}>
          {currentPosition
            ? `${currentPosition.lat.toFixed(4)}°, ${currentPosition.lng.toFixed(4)}°`
            : '-16.5385°, -67.8924° (Mururata)'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#051712',
    borderWidth: 1,
    borderColor: '#1A4537',
    position: 'relative',
    marginVertical: 8,
  },
  svg: {
    borderRadius: 14,
  },
  hudBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(5, 23, 18, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  hudText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  coordsBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(5, 23, 18, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordsText: {
    color: '#34D399',
    fontSize: 10,
    fontFamily: 'System',
    fontWeight: '600',
  },
});
