import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import {
  CircleDot,
  Play,
  Pause,
  Save,
  MapPin,
  Mountain,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react-native';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { RouteDifficulty, RouteModel, Coordinates, Checkpoint } from '../../../core/domain/types';
import { NativeTrekkingMap } from '../../components/map/NativeTrekkingMap';
import { AndeanTheme } from '../../theme';

export const NativeRecordView: React.FC = () => {
  const { currentUser } = useAuth();
  const { addRoute } = useTrekkingStore();

  const [routeTitle, setRouteTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<RouteDifficulty>('moderado');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPoints, setRecordedPoints] = useState<Coordinates[]>([
    { lat: -16.5385, lng: -67.8924, altitude: 4650 },
    { lat: -16.532, lng: -67.885, altitude: 4520 },
    { lat: -16.525, lng: -67.878, altitude: 4380 },
  ]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleAddWaypoint = () => {
    const last = recordedPoints[recordedPoints.length - 1];
    const newPt: Coordinates = {
      lat: last.lat + 0.005 * (Math.random() - 0.4),
      lng: last.lng + 0.005 * (Math.random() - 0.4),
      altitude: Math.round((last.altitude || 4500) + (Math.random() * 80 - 40)),
    };
    setRecordedPoints([...recordedPoints, newPt]);
  };

  const handleSaveRoute = () => {
    if (!routeTitle.trim()) {
      Alert.alert('Nombre Requerido', 'Por favor ingresa un nombre para la ruta.');
      return;
    }

    const firstPt = recordedPoints[0];
    const lastPt = recordedPoints[recordedPoints.length - 1];

    const cp: Checkpoint = {
      id: `cp-${Date.now()}`,
      name: 'Campamento Base',
      category: 'refugio',
      lat: firstPt.lat,
      lng: firstPt.lng,
      createdAt: Date.now(),
    };

    const newRoute: RouteModel = {
      id: `custom-${Date.now()}`,
      title: routeTitle,
      description: description || 'Ruta registrada en vivo con GPS andino de alta precisión.',
      region: 'Cordillera Real, Bolivia',
      difficulty,
      modality: 'acompañado',
      durationMinutes: Math.round(recordedPoints.length * 25),
      distanceKm: Number((recordedPoints.length * 1.8).toFixed(1)),
      elevationGainM: 420,
      startPoint: {
        name: 'Punto de Inicio GPS',
        lat: firstPt.lat,
        lng: firstPt.lng,
      },
      endPoint: {
        name: 'Punto de Llegada GPS',
        lat: lastPt.lat,
        lng: lastPt.lng,
      },
      waypoints: recordedPoints,
      checkpoints: [cp],
      photos: [],
      creatorId: currentUser?.uid || 'anonymous',
      creatorName: currentUser?.displayName || 'Senderista Anónimo',
      status: currentUser?.role === 'admin' ? 'published' : 'in_review',
      isPrivate: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addRoute(newRoute);
    setSavedSuccess(true);
    setIsRecording(false);
    setTimeout(() => {
      setSavedSuccess(false);
      setRouteTitle('');
      setDescription('');
    }, 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <CircleDot size={18} color="#EF4444" />
        </View>
        <View>
          <Text style={styles.title}>Grabador GPS de Rutas</Text>
          <Text style={styles.subtitle}>Trazado satelital y telemetría de campo</Text>
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Nombre de la Ruta / Sendero</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Ascenso Mururata por Mina Bolsa Negra"
          placeholderTextColor="#6B7280"
          value={routeTitle}
          onChangeText={setRouteTitle}
        />

        <Text style={styles.fieldLabel}>Descripción Técnica</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Condiciones del terreno, pasos de agua, sendero..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={2}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.fieldLabel}>Nivel de Dificultad</Text>
        <View style={styles.diffRow}>
          {(['facil', 'moderado', 'dificil', 'experto'] as RouteDifficulty[]).map((d) => (
            <Pressable
              key={d}
              onPress={() => setDifficulty(d)}
              style={[styles.diffPill, difficulty === d && styles.diffPillActive]}
            >
              <Text
                style={[
                  styles.diffPillText,
                  difficulty === d && styles.diffPillTextActive,
                ]}
              >
                {d.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Real-time Map Preview */}
      <NativeTrekkingMap
        waypoints={recordedPoints}
        currentPosition={recordedPoints[recordedPoints.length - 1]}
        height={200}
        title={`Puntos Capturados: ${recordedPoints.length}`}
      />

      {/* Live Track Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <MapPin size={14} color="#10B981" />
          <Text style={styles.metricLabel}>Puntos GPS</Text>
          <Text style={styles.metricValue}>{recordedPoints.length}</Text>
        </View>
        <View style={styles.metricBox}>
          <TrendingUp size={14} color="#F59E0B" />
          <Text style={styles.metricLabel}>Distancia Est.</Text>
          <Text style={styles.metricValue}>{(recordedPoints.length * 1.8).toFixed(1)} km</Text>
        </View>
        <View style={styles.metricBox}>
          <Mountain size={14} color="#60A5FA" />
          <Text style={styles.metricLabel}>Altitud Actual</Text>
          <Text style={styles.metricValue}>
            {recordedPoints[recordedPoints.length - 1]?.altitude || 4650}m
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleToggleRecord}
          style={[styles.btnRecord, isRecording ? styles.btnRecording : styles.btnStart]}
        >
          {isRecording ? (
            <>
              <Pause size={16} color="#FFFFFF" />
              <Text style={styles.btnRecordText}>Pausar Grabación</Text>
            </>
          ) : (
            <>
              <Play size={16} color="#FFFFFF" />
              <Text style={styles.btnRecordText}>Iniciar Grabador</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={handleAddWaypoint} style={styles.btnAddPoint}>
          <MapPin size={16} color="#34D399" />
          <Text style={styles.btnAddPointText}>+ Waypoint</Text>
        </Pressable>
      </View>

      {/* Save Button */}
      <Pressable
        onPress={handleSaveRoute}
        style={[styles.btnSave, savedSuccess && styles.btnSaveSuccess]}
      >
        {savedSuccess ? (
          <>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.btnSaveText}>¡Ruta Guardada en el Catálogo!</Text>
          </>
        ) : (
          <>
            <Save size={16} color="#FFFFFF" />
            <Text style={styles.btnSaveText}>Guardar Ruta en Catálogo</Text>
          </>
        )}
      </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  card: {
    backgroundColor: '#0E2E24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 14,
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#051712',
    borderWidth: 1,
    borderColor: '#1A4537',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F9FAFB',
    fontSize: 12,
    marginBottom: 6,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  diffRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  diffPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#051712',
    borderWidth: 1,
    borderColor: '#1A4537',
    alignItems: 'center',
  },
  diffPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  diffPillText: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: 'bold',
  },
  diffPillTextActive: {
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0E2E24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  metricValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  btnRecord: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnStart: {
    backgroundColor: '#10B981',
  },
  btnRecording: {
    backgroundColor: '#F59E0B',
  },
  btnRecordText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnAddPoint: {
    flex: 1,
    backgroundColor: '#0A241C',
    borderWidth: 1,
    borderColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnAddPointText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  btnSave: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  btnSaveSuccess: {
    backgroundColor: '#10B981',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
