import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { AndeanTheme } from '../../theme';

const { colors } = AndeanTheme;

interface BannerProps {
  tone: 'error' | 'success';
  message: string;
}

/** Banner de estado (error/éxito). Para errores por campo usar `Field error=`. */
export const Banner: React.FC<BannerProps> = ({ tone, message }) => {
  const isError = tone === 'error';
  return (
    <View
      style={[styles.base, isError ? styles.error : styles.success]}
      accessibilityRole="alert"
    >
      {isError ? (
        <AlertCircle size={14} color={colors.danger} />
      ) : (
        <CheckCircle2 size={14} color={colors.primary} />
      )}
      <Text style={[styles.text, isError ? styles.errorText : styles.successText]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  text: {
    fontSize: 11,
    flex: 1,
  },
  errorText: {
    color: colors.danger,
  },
  successText: {
    color: colors.primary,
  },
});
