import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { User, Mail, Lock, Check } from 'lucide-react-native';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { RegisterSchema } from '../../../infrastructure/api/schemas';
import { Field, Button, Banner } from '../../components/native';
import { AndeanTheme } from '../../theme';

const { colors } = AndeanTheme;

interface RegisterFormProps {
  onSuccess: () => void;
}

/** Dueño de su estado + validación Zod (clave, confirmación, términos) + submit. */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const validation = RegisterSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      username: username.trim() ? username.trim().replace(/^@/, '') : undefined,
      password,
      confirmPassword,
      acceptTerms,
    });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message ?? 'Revisa los datos ingresados.');
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

  return (
    <View style={styles.card}>
      {errorMsg ? <Banner tone="error" message={errorMsg} /> : null}
      {successMsg ? <Banner tone="success" message={successMsg} /> : null}
      <Field
        label="Nombre Completo"
        value={name}
        onChangeText={setName}
        placeholder="Ej. Mateo Condori"
        icon={<User size={15} color={colors.textMuted} />}
      />
      <Field
        label="Nombre de Usuario (Opcional)"
        value={username}
        onChangeText={setUsername}
        placeholder="Ej. caminante_bolivia"
        icon={<User size={15} color={colors.textMuted} />}
        autoCapitalize="none"
      />
      <Field
        label="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="andino@trekbolivia.bo"
        icon={<Mail size={15} color={colors.textMuted} />}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Mínimo 8 caracteres"
        icon={<Lock size={15} color={colors.textMuted} />}
        secureTextEntry
      />
      <Field
        label="Verificar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repite tu contraseña"
        icon={<Lock size={15} color={colors.textMuted} />}
        secureTextEntry
      />
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
      <Button title="Completar Registro" onPress={handleSubmit} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
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
});
