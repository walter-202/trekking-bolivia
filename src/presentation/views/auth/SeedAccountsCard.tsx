import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { SEED_ADMIN_ACCOUNTS } from '../../../infrastructure/auth/AuthContext';
import { AndeanTheme } from '../../theme';

const { colors } = AndeanTheme;

interface SeedAccountsCardProps {
  onApplyPreset: (email: string, password: string) => void;
}

/** Atajos dev de cuentas seed. Uso exclusivo de auth → vive colocalizado aquí. */
export const SeedAccountsCard: React.FC<SeedAccountsCardProps> = ({ onApplyPreset }) => (
  <View style={styles.section}>
    <Text style={styles.title}>Cuentas Administradoras Preconfiguradas</Text>
    <Text style={styles.subtitle}>Toca una cuenta para autorellenar credenciales:</Text>
    {SEED_ADMIN_ACCOUNTS.map((admin) => (
      <Pressable
        key={admin.profile.uid}
        onPress={() => onApplyPreset(admin.profile.email, admin.passwords[0])}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={`Usar cuenta ${admin.profile.displayName}`}
      >
        <ShieldCheck size={14} color={colors.primary} />
        <View style={styles.info}>
          <Text style={styles.name}>{admin.profile.displayName}</Text>
          <Text style={styles.email}>{admin.profile.email}</Text>
        </View>
        <Text style={styles.pass}>{admin.passwords[0]}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 69, 55, 0.4)',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  email: {
    color: colors.textMuted,
    fontSize: 10,
  },
  pass: {
    color: colors.primaryLight,
    fontSize: 10,
  },
});
