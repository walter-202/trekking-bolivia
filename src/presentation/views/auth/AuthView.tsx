import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Mountain, ArrowLeft } from 'lucide-react-native';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { SeedAccountsCard } from './SeedAccountsCard';
import { AndeanTheme } from '../../theme';

const { colors } = AndeanTheme;

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onBack: () => void;
  onSuccess: () => void;
}

/** Compositor auth: tabs + form activo + atajos seed. Estado de negocio vive en cada form. */
export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onBack,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  // Preset seed → remonta el login con valores iniciales (evita sincronizar estado entre vista y form)
  const [loginPreset, setLoginPreset] = useState({ email: '', password: '', key: 0 });

  const handleApplyPreset = (email: string, password: string) => {
    setLoginPreset((p) => ({ email, password, key: p.key + 1 }));
    setMode('login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable
        onPress={onBack}
        style={styles.btnBack}
        accessibilityRole="button"
        accessibilityLabel="Volver a explorar"
      >
        <ArrowLeft size={18} color={colors.primaryLight} />
        <Text style={styles.btnBackText}>Volver a Explorar</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Mountain size={28} color={colors.primaryLight} />
        </View>
        <Text style={styles.title}>
          {mode === 'login' ? 'Iniciar Sesión Andina' : 'Crear Cuenta de Senderista'}
        </Text>
        <Text style={styles.subtitle}>
          Plataforma de montañismo, cartografía offline y rescate en Bolivia
        </Text>
      </View>

      <View style={styles.modeTabs}>
        <Pressable
          onPress={() => setMode('login')}
          style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
          accessibilityRole="tab"
          accessibilityLabel="Iniciar sesión"
          accessibilityState={{ selected: mode === 'login' }}
        >
          <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
            Iniciar Sesión
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('register')}
          style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
          accessibilityRole="tab"
          accessibilityLabel="Registrarse"
          accessibilityState={{ selected: mode === 'register' }}
        >
          <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
            Registrarse
          </Text>
        </Pressable>
      </View>

      {mode === 'login' ? (
        <LoginForm
          key={loginPreset.key}
          initialEmail={loginPreset.email}
          initialPassword={loginPreset.password}
          onSuccess={onSuccess}
        />
      ) : (
        <RegisterForm onSuccess={onSuccess} />
      )}

      <SeedAccountsCard onApplyPreset={handleApplyPreset} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    minHeight: 44,
  },
  btnBackText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
});
