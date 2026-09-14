import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {
  User,
  ShieldCheck,
  Award,
  Compass,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Database,
} from 'lucide-react-native';
import { useAuth, SEED_ADMIN_ACCOUNTS } from '../../../infrastructure/auth/AuthContext';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { OfflineRegion } from '../../../infrastructure/persistence/tileCacheDB';
import { AndeanTheme } from '../../theme';

interface NativeProfileViewProps {
  onOpenAuth: () => void;
}

export const NativeProfileView: React.FC<NativeProfileViewProps> = ({ onOpenAuth }) => {
  const { currentUser, logout, switchDemoRole } = useAuth();
  const { offlineRegions, deleteOfflineRegion } = useTrekkingStore();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleSelectAdminPreset = (account: typeof SEED_ADMIN_ACCOUNTS[0]) => {
    switchDemoRole('admin');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBig}>
          {currentUser?.role === 'admin' ? (
            <ShieldCheck size={36} color="#FFFFFF" />
          ) : (
            <User size={36} color="#FFFFFF" />
          )}
        </View>

        <Text style={styles.displayName}>
          {currentUser?.displayName || 'Usuario Invitado'}
        </Text>
        <Text style={styles.emailText}>{currentUser?.email || 'Sin sesión activa'}</Text>

        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>
            {currentUser?.role === 'admin' ? 'ADMINISTRADOR ANDINO' : 'SENDERISTA REGISTRADO'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Award size={16} color="#F59E0B" />
            <Text style={styles.statVal}>{currentUser?.summitsCount || 0}</Text>
            <Text style={styles.statLabel}>Cumbres</Text>
          </View>

          <View style={styles.statBox}>
            <Compass size={16} color="#10B981" />
            <Text style={styles.statVal}>{currentUser?.gpsAccuracy || '±2.4m'}</Text>
            <Text style={styles.statLabel}>Precisión GPS</Text>
          </View>
        </View>
      </View>

      {/* Seed Admins Quick Selector */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Cuentas de Acceso Rápido (Admins & Pruebas)</Text>
        <Text style={styles.sectionSubtitle}>
          Selecciona una cuenta para alternar privilegios de administración:
        </Text>

        {SEED_ADMIN_ACCOUNTS.map((acc) => (
          <Pressable
            key={acc.profile.uid}
            onPress={() => handleSelectAdminPreset(acc)}
            style={styles.adminRow}
          >
            <View style={styles.adminIconBox}>
              <ShieldCheck size={14} color="#34D399" />
            </View>
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>{acc.profile.displayName}</Text>
              <Text style={styles.adminEmail}>{acc.profile.email}</Text>
            </View>
            <ChevronRight size={14} color="#6B7280" />
          </Pressable>
        ))}
      </View>

      {/* Offline Storage Manager */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Database size={16} color="#10B981" />
          <Text style={styles.sectionTitle}>Mapas Topográficos Offline</Text>
        </View>

        {offlineRegions.length === 0 ? (
          <Text style={styles.emptyOfflineText}>
            No hay sectores descargados. Puedes bajar sectores desde la pantalla "Explorar".
          </Text>
        ) : (
          offlineRegions.map((region: OfflineRegion) => (
            <View key={region.id} style={styles.regionItem}>
              <View style={styles.regionInfo}>
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionSize}>
                  {(region.sizeBytes / (1024 * 1024)).toFixed(1)} MB • {region.tileCount} sectores
                </Text>
              </View>

              <Pressable
                onPress={() => deleteOfflineRegion(region.id)}
                style={styles.btnDeleteRegion}
              >
                <Trash2 size={14} color="#EF4444" />
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Auth Actions */}
      {currentUser ? (
        <Pressable onPress={handleLogout} style={styles.btnLogout}>
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.btnLogoutText}>Cerrar Sesión</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onOpenAuth} style={styles.btnLogin}>
          <User size={16} color="#FFFFFF" />
          <Text style={styles.btnLoginText}>Iniciar Sesión o Registrarse</Text>
        </Pressable>
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
  profileCard: {
    backgroundColor: '#0E2E24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#34D399',
  },
  displayName: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '800',
  },
  emailText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  rolePillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#051712',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 10,
    alignItems: 'center',
  },
  statVal: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#0E2E24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 14,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 69, 55, 0.5)',
  },
  adminIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0A241C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  adminEmail: {
    color: '#6B7280',
    fontSize: 10,
  },
  emptyOfflineText: {
    color: '#6B7280',
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 69, 55, 0.5)',
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  regionSize: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },
  btnDeleteRegion: {
    padding: 6,
  },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  btnLogoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  btnLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  btnLoginText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
