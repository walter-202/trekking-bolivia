import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Mountain, Wifi, WifiOff, FlaskConical, User, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { AndeanTheme } from '../../theme';

interface NativeHeaderProps {
  onOpenAuth: () => void;
  onOpenTests: () => void;
  onOpenProfile: () => void;
}

export const NativeHeader: React.FC<NativeHeaderProps> = ({
  onOpenAuth,
  onOpenTests,
  onOpenProfile,
}) => {
  const { currentUser } = useAuth();
  const { isOfflineMode, toggleOfflineMode } = useTrekkingStore();

  return (
    <View style={styles.header}>
      {/* Brand & Logo */}
      <View style={styles.brandRow}>
        <View style={styles.iconBox}>
          <Mountain size={18} color="#34D399" />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Trekking Bolivia</Text>
            <View style={styles.badgePro}>
              <Text style={styles.badgeProText}>PRO v2.4</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Andes & Topografía Offline</Text>
        </View>
      </View>

      {/* Action Badges */}
      <View style={styles.actionsRow}>
        {/* Offline Mode Toggle */}
        <Pressable
          onPress={() => toggleOfflineMode()}
          style={[
            styles.modeButton,
            isOfflineMode ? styles.modeButtonOffline : styles.modeButtonOnline,
          ]}
        >
          {isOfflineMode ? (
            <>
              <WifiOff size={12} color="#F59E0B" />
              <Text style={styles.modeTextOffline}>Offline</Text>
            </>
          ) : (
            <>
              <Wifi size={12} color="#10B981" />
              <Text style={styles.modeTextOnline}>Online</Text>
            </>
          )}
        </Pressable>

        {/* Tests Button */}
        <Pressable onPress={onOpenTests} style={styles.iconButton} accessibilityLabel="Pruebas Unitarias">
          <FlaskConical size={16} color="#10B981" />
        </Pressable>

        {/* Profile / Auth Button */}
        <Pressable
          onPress={currentUser ? onOpenProfile : onOpenAuth}
          style={styles.profileButton}
        >
          {currentUser ? (
            <View style={styles.avatarMini}>
              {currentUser.role === 'admin' ? (
                <ShieldCheck size={12} color="#FFFFFF" />
              ) : (
                <Text style={styles.avatarInitial}>
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </Text>
              )}
            </View>
          ) : (
            <User size={14} color="#A7F3D0" />
          )}
          <Text style={styles.profileName} numberOfLines={1}>
            {currentUser ? currentUser.displayName.split(' ')[0] : 'Ingresar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#051712',
    borderBottomWidth: 1,
    borderBottomColor: '#1A4537',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0A241C',
    borderWidth: 1,
    borderColor: '#154837',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  badgePro: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  badgeProText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeButtonOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  modeButtonOffline: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  modeTextOnline: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  modeTextOffline: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0E2E24',
    borderWidth: 1,
    borderColor: '#1A4537',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E2E24',
    borderWidth: 1,
    borderColor: '#1A4537',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  avatarMini: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 60,
  },
});
