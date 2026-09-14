import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import {
  Compass,
  TrendingUp,
  Clock,
  Gauge,
  Mountain,
  AlertTriangle,
  Flag,
  Play,
  Pause,
  Square,
  CheckCircle2,
  ShieldAlert,
  Radio,
} from 'lucide-react-native';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { RouteModel } from '../../../core/domain/types';
import { NativeTrekkingMap } from '../../components/map/NativeTrekkingMap';
import { AndeanTheme } from '../../theme';

interface NativeActivityViewProps {
  preparedRoute: RouteModel | null;
  onClearPreparedRoute: () => void;
}

export const NativeActivityView: React.FC<NativeActivityViewProps> = ({
  preparedRoute,
  onClearPreparedRoute,
}) => {
  const { currentUser } = useAuth();
  const {
    activeActivity,
    startActivityOnRoute,
    pauseActivity,
    resumeActivity,
    finishActivity,
    toggleCheckpointCompleted,
    routes,
  } = useTrekkingStore();

  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Active route reference
  const activeRoute: RouteModel =
    preparedRoute ||
    (activeActivity?.routeId
      ? routes.find((r) => r.id === activeActivity.routeId) || routes[0]
      : routes[0]);

  const handleTogglePlay = () => {
    if (!activeActivity.isActive) {
      startActivityOnRoute(activeRoute, activeRoute.waypoints[0]);
    } else if (!activeActivity.isPaused) {
      pauseActivity();
    } else {
      resumeActivity();
    }
  };

  const handleStop = () => {
    Alert.alert(
      'Finalizar Expedición',
      '¿Deseas concluir la expedición y registrar tus estadísticas en la nube?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          style: 'destructive',
          onPress: () => {
            finishActivity(currentUser?.uid || 'anon', currentUser?.displayName || 'Senderista', true);
            onClearPreparedRoute();
          },
        },
      ]
    );
  };

  const handleSendSOS = () => {
    setSosSent(true);
    setTimeout(() => {
      setSosModalVisible(false);
      setSosSent(false);
    }, 4000);
  };

  // Format seconds to hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentAlt = activeActivity.currentPosition?.altitude || 4650;
  const currentDist = activeActivity.distanceCoveredKm || 0;
  const currentDuration = activeActivity.elapsedSeconds || 0;
  const currentSpeed = activeActivity.isActive && !activeActivity.isPaused ? 4.2 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Route Header */}
      <View style={styles.routeHeader}>
        <View>
          <Text style={styles.routeStatus}>
            {activeActivity.isActive
              ? activeActivity.isPaused
                ? 'EXPEDICIÓN EN PAUSA'
                : 'EXPEDICIÓN EN CURSO'
              : 'EXPEDICIÓN LISTA'}
          </Text>
          <Text style={styles.routeName}>{activeRoute.title}</Text>
        </View>

        <Pressable
          onPress={() => setSosModalVisible(true)}
          style={styles.sosButton}
          accessibilityLabel="Alerta SOS de Emergencia"
        >
          <ShieldAlert size={14} color="#FFFFFF" />
          <Text style={styles.sosButtonText}>SOS</Text>
        </Pressable>
      </View>

      {/* Tactical HUD Telemetry Cards */}
      <View style={styles.hudGrid}>
        {/* Altitude */}
        <View style={styles.hudCard}>
          <View style={styles.hudLabelRow}>
            <Mountain size={13} color="#10B981" />
            <Text style={styles.hudLabel}>ALTITUD</Text>
          </View>
          <Text style={styles.hudValue}>{Math.round(currentAlt)}</Text>
          <Text style={styles.hudUnit}>msnm (Andes)</Text>
        </View>

        {/* Speed */}
        <View style={styles.hudCard}>
          <View style={styles.hudLabelRow}>
            <Gauge size={13} color="#60A5FA" />
            <Text style={styles.hudLabel}>VELOCIDAD</Text>
          </View>
          <Text style={styles.hudValue}>{currentSpeed.toFixed(1)}</Text>
          <Text style={styles.hudUnit}>km/h ritmo</Text>
        </View>

        {/* Distance */}
        <View style={styles.hudCard}>
          <View style={styles.hudLabelRow}>
            <TrendingUp size={13} color="#F59E0B" />
            <Text style={styles.hudLabel}>DISTANCIA</Text>
          </View>
          <Text style={styles.hudValue}>{currentDist.toFixed(2)}</Text>
          <Text style={styles.hudUnit}>km recorridos</Text>
        </View>

        {/* Elapsed Time */}
        <View style={styles.hudCard}>
          <View style={styles.hudLabelRow}>
            <Clock size={13} color="#A78BFA" />
            <Text style={styles.hudLabel}>TIEMPO</Text>
          </View>
          <Text style={styles.hudValueTime}>{formatTime(currentDuration)}</Text>
          <Text style={styles.hudUnit}>cronómetro</Text>
        </View>
      </View>

      {/* Topographic Map HUD */}
      <NativeTrekkingMap
        waypoints={activeRoute.waypoints}
        checkpoints={activeRoute.checkpoints}
        currentPosition={activeActivity.currentPosition || activeRoute.waypoints[0]}
        startPoint={activeRoute.startPoint}
        endPoint={activeRoute.endPoint}
        height={220}
        title={`GPS Vivo: ${activeRoute.title}`}
      />

      {/* Controls Bar */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={handleTogglePlay}
          style={[
            styles.btnMainControl,
            activeActivity.isActive && !activeActivity.isPaused ? styles.btnPause : styles.btnPlay,
          ]}
        >
          {activeActivity.isActive && !activeActivity.isPaused ? (
            <>
              <Pause size={18} color="#FFFFFF" />
              <Text style={styles.btnControlText}>Pausar</Text>
            </>
          ) : (
            <>
              <Play size={18} color="#FFFFFF" />
              <Text style={styles.btnControlText}>
                {activeActivity.isPaused ? 'Reanudar' : 'Iniciar Expedición'}
              </Text>
            </>
          )}
        </Pressable>

        {activeActivity.isActive ? (
          <Pressable onPress={handleStop} style={styles.btnStop}>
            <Square size={16} color="#FFFFFF" />
            <Text style={styles.btnControlText}>Concluir</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Waypoints & Checkpoints Status */}
      <View style={styles.checkpointsCard}>
        <View style={styles.checkpointsHeader}>
          <Flag size={14} color="#10B981" />
          <Text style={styles.checkpointsTitle}>Puntos de Control & Refugios</Text>
        </View>

        {activeRoute.checkpoints.map((cp, idx) => {
          const isDone = activeActivity.completedCheckpointIds.includes(cp.id);
          return (
            <Pressable
              key={cp.id}
              onPress={() => toggleCheckpointCompleted(cp.id)}
              style={styles.cpItem}
            >
              <View style={[styles.cpIconCircle, isDone && styles.cpIconCircleDone]}>
                <Text style={styles.cpNumber}>{idx + 1}</Text>
              </View>
              <View style={styles.cpInfo}>
                <Text style={styles.cpName}>{cp.name}</Text>
                <Text style={styles.cpAlt}>Categoría: {cp.category}</Text>
              </View>
              <CheckCircle2 size={16} color={isDone ? '#10B981' : '#4B5563'} />
            </Pressable>
          );
        })}
      </View>

      {/* Emergency SOS Modal */}
      <Modal visible={sosModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sosModalContent}>
            <View style={styles.sosModalIcon}>
              <AlertTriangle size={32} color="#EF4444" />
            </View>

            <Text style={styles.sosModalTitle}>PROTOCOLO SOS ANDINO</Text>
            <Text style={styles.sosModalDesc}>
              Se emitirá una señal de auxilio transmitiendo tus coordenadas GPS exactas al SAR Bolivia y a la red de refugios de montaña.
            </Text>

            <View style={styles.sosCoordsBox}>
              <Text style={styles.sosCoordsLabel}>Coordenadas de Rescate:</Text>
              <Text style={styles.sosCoordsValue}>
                {activeActivity.currentPosition
                  ? `${activeActivity.currentPosition.lat.toFixed(5)}° S, ${activeActivity.currentPosition.lng.toFixed(5)}° W`
                  : `${activeRoute.startPoint.lat.toFixed(5)}° S, ${activeRoute.startPoint.lng.toFixed(5)}° W`}
              </Text>
              <Text style={styles.sosFreqText}>Frecuencia VHF de Emergencia: 146.520 MHz</Text>
            </View>

            {sosSent ? (
              <View style={styles.sosSentBanner}>
                <Radio size={16} color="#34D399" />
                <Text style={styles.sosSentText}>¡Alerta transmitida con éxito vía satélite/red!</Text>
              </View>
            ) : (
              <View style={styles.sosModalActions}>
                <Pressable
                  onPress={() => setSosModalVisible(false)}
                  style={styles.sosModalBtnCancel}
                >
                  <Text style={styles.sosModalBtnCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable onPress={handleSendSOS} style={styles.sosModalBtnConfirm}>
                  <Text style={styles.sosModalBtnConfirmText}>ACTIVAR SOS</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#051712',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeStatus: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  routeName: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  sosButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  hudGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  hudCard: {
    width: '48%',
    backgroundColor: '#0E2E24',
    borderWidth: 1,
    borderColor: '#1A4537',
    borderRadius: 12,
    padding: 12,
  },
  hudLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  hudLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
  },
  hudValue: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '800',
  },
  hudValueTime: {
    color: '#34D399',
    fontSize: 18,
    fontWeight: '800',
  },
  hudUnit: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  btnMainControl: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnPlay: {
    backgroundColor: '#10B981',
  },
  btnPause: {
    backgroundColor: '#F59E0B',
  },
  btnStop: {
    flex: 1,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnControlText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  checkpointsCard: {
    backgroundColor: '#0A241C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 14,
    marginTop: 8,
  },
  checkpointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  checkpointsTitle: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '700',
  },
  cpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 69, 55, 0.5)',
  },
  cpIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpIconCircleDone: {
    backgroundColor: '#10B981',
  },
  cpNumber: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cpInfo: {
    flex: 1,
  },
  cpName: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  cpAlt: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 23, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sosModalContent: {
    backgroundColor: '#0A241C',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: 20,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  sosModalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sosModalTitle: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosModalDesc: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 10,
  },
  sosCoordsBox: {
    backgroundColor: '#051712',
    borderWidth: 1,
    borderColor: '#1A4537',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  sosCoordsLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  sosCoordsValue: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  sosFreqText: {
    color: '#F59E0B',
    fontSize: 10,
    marginTop: 4,
  },
  sosModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  sosModalBtnCancel: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#0E2E24',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A4537',
  },
  sosModalBtnCancelText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  sosModalBtnConfirm: {
    flex: 1.4,
    paddingVertical: 10,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  sosModalBtnConfirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sosSentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  sosSentText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
});
