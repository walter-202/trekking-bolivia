import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Mountain,
  User,
  Clock,
  Shield,
} from 'lucide-react-native';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { RouteModel, RouteStatus } from '../../../core/domain/types';
import { AndeanTheme } from '../../theme';

export const NativeModerationView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { routes, updateRoute } = useTrekkingStore();

  const [filter, setFilter] = useState<RouteStatus>('in_review');

  const filteredRoutes = routes.filter((r) => r.status === filter);

  const handleApprove = (routeId: string) => {
    updateRoute(routeId, { status: 'published' });
    Alert.alert('Ruta Aprobada', 'La ruta ahora es pública en el catálogo oficial de Trekking Bolivia.');
  };

  const handleReject = (routeId: string) => {
    updateRoute(routeId, { status: 'rejected' });
    Alert.alert('Ruta Rechazada', 'Se ha marcado la ruta como rechazada.');
  };

  if (!isAdmin) {
    return (
      <View style={styles.accessDenied}>
        <Shield size={48} color="#EF4444" />
        <Text style={styles.deniedTitle}>Panel Restringido</Text>
        <Text style={styles.deniedSubtitle}>
          Esta sección es exclusiva para el equipo de Administración de Trekking Bolivia.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <ShieldCheck size={20} color="#10B981" />
        </View>
        <View>
          <Text style={styles.title}>Panel de Moderación Andina</Text>
          <Text style={styles.subtitle}>
            Sesión: {currentUser?.displayName} (Administrador)
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(
          [
            { key: 'in_review', label: `Pendientes (${routes.filter((r) => r.status === 'in_review').length})` },
            { key: 'published', label: 'Aprobadas' },
            { key: 'rejected', label: 'Rechazadas' },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setFilter(tab.key)}
            style={[styles.filterBtn, filter === tab.key && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === tab.key && styles.filterTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Routes List */}
      {filteredRoutes.length === 0 ? (
        <View style={styles.emptyCard}>
          <CheckCircle size={32} color="#34D399" />
          <Text style={styles.emptyTitle}>Bandeja Limpia</Text>
          <Text style={styles.emptyText}>No hay rutas en estado {filter}.</Text>
        </View>
      ) : (
        filteredRoutes.map((route) => (
          <View key={route.id} style={styles.routeCard}>
            <View style={styles.cardTop}>
              <View style={styles.routeTitleRow}>
                <Mountain size={14} color="#10B981" />
                <Text style={styles.routeName}>{route.title}</Text>
              </View>
              <View style={styles.diffBadge}>
                <Text style={styles.diffBadgeText}>{route.difficulty.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.routeDesc}>{route.description}</Text>

            <View style={styles.authorRow}>
              <User size={12} color="#9CA3AF" />
              <Text style={styles.authorText}>Autor: {route.creatorName}</Text>
              <Clock size={12} color="#9CA3AF" style={{ marginLeft: 10 }} />
              <Text style={styles.authorText}>
                {new Date(route.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              <Text style={styles.metricItem}>📏 {route.distanceKm} km</Text>
              <Text style={styles.metricItem}>⛰️ +{route.elevationGainM || 350}m</Text>
              <Text style={styles.metricItem}>⏱️ ~{Math.round(route.durationMinutes / 60)}h</Text>
            </View>

            {/* Moderation Actions */}
            {filter === 'in_review' && (
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={() => handleReject(route.id)}
                  style={styles.btnReject}
                >
                  <XCircle size={14} color="#EF4444" />
                  <Text style={styles.btnRejectText}>Rechazar</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleApprove(route.id)}
                  style={styles.btnApprove}
                >
                  <CheckCircle size={14} color="#FFFFFF" />
                  <Text style={styles.btnApproveText}>Aprobar Ruta</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))
      )}
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0E2E24',
    borderWidth: 1,
    borderColor: '#1A4537',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#0E2E24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  routeCard: {
    backgroundColor: '#0E2E24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeName: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '700',
  },
  diffBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diffBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: 'bold',
  },
  routeDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  authorText: {
    color: '#6B7280',
    fontSize: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 69, 55, 0.5)',
  },
  metricItem: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btnReject: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnRejectText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  btnApprove: {
    flex: 1.4,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnApproveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  accessDenied: {
    flex: 1,
    backgroundColor: '#051712',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  deniedTitle: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  deniedSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
