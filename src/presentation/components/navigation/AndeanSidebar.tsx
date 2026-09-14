import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import {
  X,
  Compass,
  User,
  HardDrive,
  PlusCircle,
  Layers,
  ShieldAlert,
  Settings,
  LogOut,
  CheckCircle,
  Flag,
  Radio,
  Mountain,
  ShieldCheck,
  ChevronRight,
  Wifi,
  WifiOff,
  Navigation,
  FlaskConical,
  LogIn,
} from 'lucide-react-native';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { TabKey } from '../../../core/domain/types';

interface AndeanSidebarProps {
  isOpen: boolean;
  activeTab: TabKey;
  onClose: () => void;
  onSelectTab: (tab: TabKey) => void;
  onOpenAuth: () => void;
}

export const AndeanSidebar: React.FC<AndeanSidebarProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
  onOpenAuth,
}) => {
  const { width } = useWindowDimensions();
  const { currentUser, logout, isModerator, isAdmin } = useAuth();
  const { isOfflineMode, offlineRouteIds, activitiesHistory } = useTrekkingStore();

  if (!isOpen) return null;

  const handleNavigate = (tab: TabKey) => {
    onSelectTab(tab);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    onOpenAuth();
  };

  const drawerWidth = Math.min(Math.max(width * 0.78, 280), 380);

  const displayName = currentUser?.displayName || 'Alejandro Condori';
  const username = currentUser?.username || 'caminante_andino';
  const summitsCount = currentUser?.summitsCount || 18;
  const gpsAccuracy = currentUser?.gpsAccuracy || '±2.4m Preciso';
  const roleLabel =
    currentUser?.role === 'admin'
      ? 'Administrador General'
      : 'Senderista Andino';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Cerrar drawer"
        />

        {/* Drawer panel: >= 60% of device width (DESIGN_RULES Section 3.B) */}
        <View style={[styles.drawerContainer, { width: drawerWidth }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerBrandRow}>
              <View style={styles.logoBadge}>
                <Mountain size={18} color="#10b981" />
              </View>
              <View>
                <View style={styles.brandTitleRow}>
                  <Text style={styles.brandTitle}>TREK-BOLIVIA</Text>
                  <View style={styles.brandProBadge}>
                    <Text style={styles.brandProText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.brandSubtitle}>ANDEAN TOPO GUIDE</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityLabel="Cerrar"
            >
              <X size={18} color="#cbd5e1" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarRow}>
                {/* Avatar with online indicator */}
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarCircle}>
                    <User size={24} color="#10b981" />
                  </View>
                  <View style={styles.onlineBadge} />
                </View>

                {/* Identity & Role */}
                <View style={styles.profileIdentity}>
                  <View style={styles.nameRow}>
                    <Text style={styles.displayName} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <CheckCircle size={14} color="#10b981" />
                  </View>
                  <Text style={styles.usernameText}>@{username}</Text>
                  <View style={styles.goldRoleBadge}>
                    <Text style={styles.goldRoleText}>🏆 {roleLabel}</Text>
                  </View>
                </View>
              </View>

              {/* Twin Stat Boxes */}
              <View style={styles.twinStatsRow}>
                <View style={styles.statBox}>
                  <Flag size={14} color="#10b981" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>CUMBRES</Text>
                    <Text style={styles.statValue}>{summitsCount} registradas</Text>
                  </View>
                </View>

                <View style={styles.statBox}>
                  <Radio size={14} color="#10b981" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>GPS FIX</Text>
                    <Text style={[styles.statValue, { color: '#10b981' }]}>
                      {gpsAccuracy}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Navigation Group: Exploración Principal */}
            <View style={styles.navGroup}>
              <Text style={styles.groupHeaderTitle}>EXPLORACIÓN PRINCIPAL</Text>

              {/* INICIO */}
              <Pressable
                onPress={() => handleNavigate('explore')}
                style={[
                  styles.navItem,
                  activeTab === 'explore' && styles.navItemActive,
                ]}
              >
                <View style={styles.navItemLeft}>
                  <View
                    style={[
                      styles.navIconBox,
                      activeTab === 'explore' && styles.navIconBoxActive,
                    ]}
                  >
                    <Compass
                      size={18}
                      color={activeTab === 'explore' ? '#ffffff' : '#10b981'}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.navItemTitle,
                        activeTab === 'explore' && styles.navItemTitleActive,
                      ]}
                    >
                      INICIO
                    </Text>
                    <Text style={styles.navItemSubtitle}>
                      Mapa Explorer Topográfico
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.activeIndicatorBadge,
                    activeTab === 'explore' && styles.activeIndicatorBadgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.activeIndicatorText,
                      activeTab === 'explore' && styles.activeIndicatorTextSelected,
                    ]}
                  >
                    ● En Vivo
                  </Text>
                </View>
              </Pressable>

              {/* ACTIVIDAD */}
              <Pressable
                onPress={() => handleNavigate('activity')}
                style={[
                  styles.navItem,
                  activeTab === 'activity' && styles.navItemActive,
                ]}
              >
                <View style={styles.navItemLeft}>
                  <View
                    style={[
                      styles.navIconBox,
                      activeTab === 'activity' && styles.navIconBoxActive,
                    ]}
                  >
                    <Navigation
                      size={18}
                      color={activeTab === 'activity' ? '#ffffff' : '#10b981'}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.navItemTitle,
                        activeTab === 'activity' && styles.navItemTitleActive,
                      ]}
                    >
                      ACTIVIDAD
                    </Text>
                    <Text style={styles.navItemSubtitle}>
                      Navegación & Brújula en Ruta
                    </Text>
                  </View>
                </View>
                <Text style={styles.gpsBadgeText}>GPS</Text>
              </Pressable>

              {/* PERFIL */}
              <Pressable
                onPress={() => handleNavigate('profile')}
                style={[
                  styles.navItem,
                  activeTab === 'profile' && styles.navItemActive,
                ]}
              >
                <View style={styles.navItemLeft}>
                  <View
                    style={[
                      styles.navIconBox,
                      activeTab === 'profile' && styles.navIconBoxActive,
                    ]}
                  >
                    <User
                      size={18}
                      color={activeTab === 'profile' ? '#ffffff' : '#10b981'}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.navItemTitle,
                        activeTab === 'profile' && styles.navItemTitleActive,
                      ]}
                    >
                      PERFIL
                    </Text>
                    <Text style={styles.navItemSubtitle}>
                      Bitácora, Logros & Medallas
                    </Text>
                  </View>
                </View>
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>
                    {activitiesHistory?.length || 12}
                  </Text>
                </View>
              </Pressable>

              {/* DESCARGAS */}
              <Pressable
                onPress={() => handleNavigate('profile')}
                style={styles.navItem}
              >
                <View style={styles.navItemLeft}>
                  <View style={styles.navIconBox}>
                    <HardDrive size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text style={styles.navItemTitle}>DESCARGAS</Text>
                    <Text style={styles.navItemSubtitle}>
                      Zonas Offline Sin Señal
                    </Text>
                  </View>
                </View>
                <View style={styles.downloadsBadge}>
                  <Text style={styles.downloadsBadgeText}>
                    {offlineRouteIds?.length || 3} Activas
                  </Text>
                </View>
              </Pressable>

              {/* NUEVA RUTA */}
              <Pressable
                onPress={() => handleNavigate('record')}
                style={[
                  styles.navItem,
                  activeTab === 'record' && styles.navItemActive,
                ]}
              >
                <View style={styles.navItemLeft}>
                  <View
                    style={[
                      styles.navIconBox,
                      activeTab === 'record' && styles.navIconBoxActive,
                    ]}
                  >
                    <PlusCircle
                      size={18}
                      color={activeTab === 'record' ? '#ffffff' : '#10b981'}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.navItemTitle,
                        activeTab === 'record' && styles.navItemTitleActive,
                      ]}
                    >
                      NUEVA RUTA
                    </Text>
                    <Text style={styles.navItemSubtitle}>
                      Trazar Track & Grabar GPX
                    </Text>
                  </View>
                </View>
                <View style={styles.recordingPulse} />
              </Pressable>
            </View>

            {/* Navigation Group: Herramientas Pro */}
            <View style={styles.navGroup}>
              <Text style={styles.groupHeaderTitle}>HERRAMIENTAS PRO</Text>

              <Pressable
                onPress={() => handleNavigate('explore')}
                style={styles.navItem}
              >
                <View style={styles.navItemLeft}>
                  <View style={styles.navIconBox}>
                    <Layers size={18} color="#10b981" />
                  </View>
                  <Text style={styles.navItemTitle}>Capas IGM & Satélite</Text>
                </View>
                <ChevronRight size={16} color="#94a3b8" />
              </Pressable>

              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Protocolo de Rescate SOS',
                    'Frecuencias SAR Bolivia y coordenadas GPS sincronizadas localmente para emergencias de montaña.'
                  )
                }
                style={styles.navItem}
              >
                <View style={styles.navItemLeft}>
                  <View style={styles.navIconBox}>
                    <ShieldAlert size={18} color="#f59e0b" />
                  </View>
                  <Text style={styles.navItemTitle}>Auditoría de Rescate</Text>
                </View>
                <View style={styles.sosBadge}>
                  <Text style={styles.sosBadgeText}>SOS SOS</Text>
                </View>
              </Pressable>

              {isAdmin && (
                <Pressable
                  onPress={() => handleNavigate('moderation')}
                  style={styles.navItem}
                >
                  <View style={styles.navItemLeft}>
                    <View style={styles.navIconBox}>
                      <ShieldCheck size={18} color="#10b981" />
                    </View>
                    <Text style={styles.navItemTitle}>Moderación de Rutas</Text>
                  </View>
                  <View style={styles.rbacBadge}>
                    <Text style={styles.rbacBadgeText}>ADMIN</Text>
                  </View>
                </Pressable>
              )}

              <Pressable
                onPress={() => handleNavigate('tests')}
                style={[
                  styles.navItem,
                  activeTab === 'tests' && styles.navItemActive,
                ]}
              >
                <View style={styles.navItemLeft}>
                  <View
                    style={[
                      styles.navIconBox,
                      activeTab === 'tests' && styles.navIconBoxActive,
                    ]}
                  >
                    <FlaskConical
                      size={18}
                      color={activeTab === 'tests' ? '#ffffff' : '#10b981'}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.navItemTitle,
                        activeTab === 'tests' && styles.navItemTitleActive,
                      ]}
                    >
                      Pruebas Unitarias
                    </Text>
                    <Text style={styles.navItemSubtitle}>
                      Suite TDD de Dominio
                    </Text>
                  </View>
                </View>
                <View style={styles.rbacBadge}>
                  <Text style={styles.rbacBadgeText}>TDD</Text>
                </View>
              </Pressable>
            </View>

            {/* Offline Storage Status Box */}
            <View style={styles.storageCard}>
              <View style={styles.storageHeaderRow}>
                <View style={styles.storageTitleRow}>
                  <HardDrive size={14} color="#10b981" />
                  <Text style={styles.storageTitle}>Almacenamiento Offline</Text>
                </View>
                <Text style={styles.storageSizeText}>
                  <Text style={{ color: '#10b981', fontWeight: '800' }}>4.2 GB</Text> / 64 GB
                </Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarTrack}>
                <View style={styles.progressBarFill} />
              </View>

              <View style={styles.storageFooterRow}>
                <Text style={styles.storageStatusLabel}>
                  Cordillera Real sincronizada
                </Text>
                <Text style={styles.storageStatusValue}>✓ Al día</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerButtonsRow}>
              <Pressable
                onPress={() => handleNavigate('profile')}
                style={styles.settingsButton}
              >
                <Settings size={14} color="#10b981" />
                <Text style={styles.settingsButtonText}>Ajustes</Text>
              </Pressable>

              {currentUser ? (
                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                  <LogOut size={14} color="#fca5a5" />
                  <Text style={styles.logoutButtonText}>Salir</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => handleNavigate('auth')} style={styles.loginButton}>
                  <LogIn size={14} color="#10b981" />
                  <Text style={styles.loginButtonText}>Acceder</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.engineRow}>
              <Text style={styles.engineText}>v2.8.4 • Andean Engine</Text>
              <View style={styles.connectivityRow}>
                {isOfflineMode ? (
                  <>
                    <WifiOff size={12} color="#f59e0b" />
                    <Text style={styles.offlineText}>Offline</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Conectado</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  drawerContainer: {
    height: '100%',
    backgroundColor: '#051712', // Andean Pine
    borderRightWidth: 1,
    borderRightColor: '#12382c', // Borde Táctico
    justifyContent: 'space-between',
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#12382c',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 78, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandProBadge: {
    backgroundColor: '#022c22',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  brandProText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6ee7b7',
  },
  brandSubtitle: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'rgba(16, 185, 129, 0.8)',
    letterSpacing: 1,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },
  profileCard: {
    backgroundColor: '#082019', // Slate Forest
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#144233',
    gap: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0d2f25',
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#082019',
  },
  profileIdentity: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    flexShrink: 1,
  },
  usernameText: {
    fontSize: 11,
    color: 'rgba(52, 211, 153, 0.9)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  goldRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  goldRoleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fcd34d',
  },
  twinStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#061813',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#12382c',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 1,
  },
  navGroup: {
    gap: 4,
  },
  groupHeaderTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 32, 25, 0.7)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#12382c',
  },
  navItemActive: {
    backgroundColor: '#059669',
    borderColor: '#10b981',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#051712',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconBoxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  navItemTitleActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  navItemSubtitle: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 1,
  },
  activeIndicatorBadge: {
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeIndicatorBadgeSelected: {
    backgroundColor: 'rgba(2, 44, 34, 0.5)',
  },
  activeIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
  },
  activeIndicatorTextSelected: {
    color: '#a7f3d0',
  },
  gpsBadgeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#10b981',
    fontWeight: '700',
  },
  countPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#12382c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  downloadsBadge: {
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  downloadsBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
  },
  recordingPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  sosBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sosBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fbbf24',
  },
  rbacBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rbacBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
  },
  storageCard: {
    backgroundColor: '#082019',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#144233',
    gap: 8,
  },
  storageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storageTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  storageSizeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#94a3b8',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#051712',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '18%',
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  storageFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storageStatusLabel: {
    fontSize: 9,
    color: '#94a3b8',
  },
  storageStatusValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10b981',
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#12382c',
    gap: 10,
  },
  footerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#082019',
    borderWidth: 1,
    borderColor: '#144233',
    paddingVertical: 8,
    borderRadius: 10,
  },
  settingsButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  logoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(153, 27, 27, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.4)',
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fca5a5',
  },
  loginButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  engineText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#64748b',
  },
  connectivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10b981',
  },
  offlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f59e0b',
  },
});
