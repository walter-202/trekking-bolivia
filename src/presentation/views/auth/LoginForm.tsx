import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../../../infrastructure/auth/AuthContext';
import { LoginSchema } from '../../../infrastructure/api/schemas';
import { Field, Button, Banner } from '../../components/native';
import { AndeanTheme } from '../../theme';

const { colors } = AndeanTheme;

interface LoginFormProps {
  initialEmail?: string;
  initialPassword?: string;
  onSuccess: () => void;
}

/** Dueño de su estado + validación Zod + submit. No sabe de navegación. */
export const LoginForm: React.FC<LoginFormProps> = ({
  initialEmail = '',
  initialPassword = '',
  onSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const validation = LoginSchema.safeParse({ email: email.trim(), password });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message ?? 'Revisa los datos ingresados.');
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
  };

  return (
    <View style={styles.card}>
      {errorMsg ? <Banner tone="error" message={errorMsg} /> : null}
      {successMsg ? <Banner tone="success" message={successMsg} /> : null}
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
        placeholder="••••••••"
        icon={<Lock size={15} color={colors.textMuted} />}
        secureTextEntry
      />
      <Button
        title="Acceder a Trekking Bolivia"
        onPress={handleSubmit}
        loading={loading}
      />
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
});
