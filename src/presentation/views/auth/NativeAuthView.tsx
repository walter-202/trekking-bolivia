import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Mountain,
  Lock,
  Mail,
  User,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { useAuth, SEED_ADMIN_ACCOUNTS } from '../../../infrastructure/auth/AuthContext';
import { AndeanTheme } from '../../theme';

interface NativeAuthViewProps {
  initialMode?: 'login' | 'register';
  onBack: () => void;
  onSuccess: () => void;
}

export const NativeAuthView: React.FC<NativeAuthViewProps> = ({
  initialMode = 'login',
  onBack,
  onSuccess,
}) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa tu correo y contraseña.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, username.trim() || undefined);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (admin: typeof SEED_ADMIN_ACCOUNTS[0]) => {
    setEmail(admin.profile.email);
    setPassword(admin.passwords[0]);
    setMode('login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back Button */}
      <Pressable onPress={onBack} style={styles.btnBack}>
        <ArrowLeft size={18} color="#34D399" />
        <Text style={styles.btnBackText}>Volver a Explorar</Text>
      </Pressable>

      {/* Brand Icon & Welcome */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Mountain size={28} color="#34D399" />
        </View>
        <Text style={styles.title}>
          {mode === 'login' ? 'Iniciar Sesión Andina' : 'Crear Cuenta de Senderista'}
        </Text>
        <Text style={styles.subtitle}>
          Plataforma de montañismo, cartografía offline y rescate en Bolivia
        </Text>
      </View>

      {/* Mode Switcher Tabs */}
      <View style={styles.modeTabs}>
        <Pressable
          onPress={() => setMode('login')}
          style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
        >
          <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
            Iniciar Sesión
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode('register')}
          style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
        >
          <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
            Registrarse
          </Text>
        </Pressable>
      </View>

      {/* Error Banner */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <AlertCircle size={14} color="#EF4444" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Input Fields */}
      <View style={styles.formCard}>
        {mode === 'register' && (
          <>
            <Text style={styles.fieldLabel}>Nombre Completo</Text>
            <View style={styles.inputRow}>
              <User size={15} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Ej. Fernando Aguilar"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.fieldLabel}>Nombre de Usuario (Opcional)</Text>
            <View style={styles.inputRow}>
              <User size={15} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Ej. fernando_andes"
                placeholderTextColor="#6B7280"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </>
        )}

        <Text style={styles.fieldLabel}>Correo Electrónico</Text>
        <View style={styles.inputRow}>
          <Mail size={15} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.fieldLabel}>Contraseña</Text>
        <View style={styles.inputRow}>
          <Lock size={15} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.btnSubmit, loading && styles.btnSubmitDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnSubmitText}>
              {mode === 'login' ? 'Acceder a Trekking Bolivia' : 'Completar Registro'}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Seed Accounts Shortcuts */}
      <View style={styles.seedSection}>
        <Text style={styles.seedTitle}>Cuentas Administradoras Preconfiguradas</Text>
        <Text style={styles.seedSubtitle}>Toca una cuenta para autorellenar credenciales:</Text>

        {SEED_ADMIN_ACCOUNTS.map((admin) => (
          <Pressable
            key={admin.profile.uid}
            onPress={() => handleApplyPreset(admin)}
            style={styles.seedButton}
          >
            <ShieldCheck size={14} color="#10B981" />
            <View style={styles.seedInfo}>
              <Text style={styles.seedName}>{admin.profile.displayName}</Text>
              <Text style={styles.seedEmail}>{admin.profile.email}</Text>
            </View>
            <Text style={styles.seedPass}>{admin.passwords[0]}</Text>
          </Pressable>
        ))}
      </View>
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
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  btnBackText: {
    color: '#34D399',
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
    backgroundColor: '#0A241C',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#0A241C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 4,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#10B981',
  },
  modeTabText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    flex: 1,
  },
  formCard: {
    backgroundColor: '#0E2E24',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 16,
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#051712',
    borderWidth: 1,
    borderColor: '#1A4537',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 12,
  },
  btnSubmit: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnSubmitDisabled: {
    opacity: 0.6,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  seedSection: {
    backgroundColor: '#0E2E24',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 14,
  },
  seedTitle: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '700',
  },
  seedSubtitle: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 69, 55, 0.4)',
  },
  seedInfo: {
    flex: 1,
  },
  seedName: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  seedEmail: {
    color: '#6B7280',
    fontSize: 10,
  },
  seedPass: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: 'mono' as any,
  },
});
