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
  Eye,
  EyeOff,
  Check,
} from 'lucide-react-native';
import { useAuth, SEED_ADMIN_ACCOUNTS } from '../../../infrastructure/auth/AuthContext';
import { LoginSchema, RegisterSchema } from '../../../infrastructure/api/schemas';
import { AndeanTheme } from '../../theme';

interface NativeAuthViewProps {
  initialMode?: 'login' | 'register';
  onBack: () => void;
  onSuccess: () => void;
}

const { colors } = AndeanTheme;

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const firstZodError = (result: { success: boolean; error?: { issues: { message: string }[] } }): string | null => {
    if (result.success || !result.error) return null;
    return result.error.issues[0]?.message ?? 'Revisa los datos ingresados.';
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      const validation = LoginSchema.safeParse({ email: email.trim(), password });
      const validationError = firstZodError(validation);
      if (validationError) {
        setErrorMsg(validationError);
        return;
      }
      setLoading(true);
      try {
        await login(email.trim(), password);
        setSuccessMsg('Sesión iniciada correctamente.');
        setTimeout(onSuccess, 700);
      } catch {
        setErrorMsg('Credenciales inválidas. Verifica tu correo y contraseña.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const validation = RegisterSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      username: username.trim() ? username.trim().replace(/^@/, '') : undefined,
      password,
      confirmPassword,
      acceptTerms,
    });
    const validationError = firstZodError(validation);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, username.trim() || undefined);
      setSuccessMsg('¡Cuenta creada exitosamente! Bienvenido a Trekking Bolivia.');
      setTimeout(onSuccess, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (admin: typeof SEED_ADMIN_ACCOUNTS[0]) => {
    setEmail(admin.profile.email);
    setPassword(admin.passwords[0]);
    switchMode('login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back Button */}
      <Pressable
        onPress={onBack}
        style={styles.btnBack}
        accessibilityRole="button"
        accessibilityLabel="Volver a explorar"
      >
        <ArrowLeft size={18} color={colors.primaryLight} />
        <Text style={styles.btnBackText}>Volver a Explorar</Text>
      </Pressable>

      {/* Brand Icon & Welcome */}
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

      {/* Mode Switcher Tabs */}
      <View style={styles.modeTabs}>
        <Pressable
          onPress={() => switchMode('login')}
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
          onPress={() => switchMode('register')}
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

      {/* Error Banner */}
      {errorMsg ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <AlertCircle size={14} color={colors.danger} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Success Banner */}
      {successMsg ? (
        <View style={styles.successBox}>
          <CheckCircle2 size={14} color={colors.primary} />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      ) : null}

      {/* Input Fields */}
      <View style={styles.formCard}>
        {mode === 'register' && (
          <>
            <Text style={styles.fieldLabel}>Nombre Completo</Text>
            <View style={styles.inputRow}>
              <User size={15} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Ej. Mateo Condori"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.fieldLabel}>Nombre de Usuario (Opcional)</Text>
            <View style={styles.inputRow}>
              <User size={15} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Ej. caminante_bolivia"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </>
        )}

        <Text style={styles.fieldLabel}>Correo Electrónico</Text>
        <View style={styles.inputRow}>
          <Mail size={15} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="andino@trekbolivia.bo"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.fieldLabel}>Contraseña</Text>
        <View style={styles.inputRow}>
          <Lock size={15} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
          >
            {showPassword ? (
              <EyeOff size={15} color={colors.textMuted} />
            ) : (
              <Eye size={15} color={colors.textMuted} />
            )}
          </Pressable>
        </View>

        {mode === 'register' && (
          <>
            <Text style={styles.fieldLabel}>Verificar Contraseña</Text>
            <View style={styles.inputRow}>
              <Lock size={15} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                hitSlop={8}
              >
                {showConfirmPassword ? (
                  <EyeOff size={15} color={colors.textMuted} />
                ) : (
                  <Eye size={15} color={colors.textMuted} />
                )}
              </Pressable>
            </View>

            <Pressable
              onPress={() => setAcceptTerms((v) => !v)}
              style={styles.termsRow}
              accessibilityRole="checkbox"
              accessibilityLabel="Aceptar términos y normas de seguridad en montaña"
              accessibilityState={{ checked: acceptTerms }}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms ? <Check size={13} color={colors.white} /> : null}
              </View>
              <Text style={styles.termsText}>
                Acepto los términos y las normas de seguridad en montaña.
              </Text>
            </Pressable>
          </>
        )}

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.btnSubmit, loading && styles.btnSubmitDisabled]}
          accessibilityRole="button"
          accessibilityLabel={mode === 'login' ? 'Acceder a Trekking Bolivia' : 'Completar registro'}
          accessibilityState={{ disabled: loading }}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
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
            accessibilityRole="button"
            accessibilityLabel={`Usar cuenta ${admin.profile.displayName}`}
          >
            <ShieldCheck size={14} color={colors.primary} />
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
    color: colors.danger,
    fontSize: 11,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  successText: {
    color: colors.primary,
    fontSize: 11,
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 44,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    paddingVertical: 10,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  btnSubmit: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnSubmitDisabled: {
    opacity: 0.6,
  },
  btnSubmitText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  seedSection: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  seedTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  seedSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    minHeight: 44,
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
    color: colors.textMuted,
    fontSize: 10,
  },
  seedPass: {
    color: colors.primaryLight,
    fontSize: 10,
  },
});
