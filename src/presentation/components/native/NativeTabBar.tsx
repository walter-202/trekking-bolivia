import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Compass, Activity, CircleDot, Shield, User } from 'lucide-react-native';
import { TabKey } from '../../../core/domain/types';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { AndeanTheme } from '../../theme';

interface NativeTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const NativeTabBar: React.FC<NativeTabBarProps> = ({ activeTab, onSelectTab }) => {
  const { isAdmin } = useAuth();

  const tabs: { key: TabKey; label: string; icon: React.FC<any> }[] = [
    { key: 'explore', label: 'Explorar', icon: Compass },
    { key: 'activity', label: 'Ruta Activa', icon: Activity },
    { key: 'record', label: 'Grabar', icon: CircleDot },
    ...(isAdmin ? [{ key: 'moderation' as TabKey, label: 'Moderar', icon: Shield }] : []),
    { key: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <IconComponent
                size={18}
                color={isActive ? '#34D399' : '#6B7280'}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#051712',
    borderTopWidth: 1,
    borderTopColor: '#1A4537',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabItemActive: {
    // subtle active indicator
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#34D399',
    fontWeight: '800',
  },
});
