import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AndeanTheme } from '../../theme';

const { colors } = AndeanTheme;

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  accessibilityLabel?: string;
}

/** Campo andino reusable: micro-label + icono + input + toggle de visibilidad + error. */
export const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  accessibilityLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const showToggle = secureTextEntry;

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, error ? styles.rowError : null]}>
        {icon}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={accessibilityLabel ?? label}
        />
        {showToggle ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
            hitSlop={8}
          >
            {visible ? (
              <EyeOff size={15} color={colors.textMuted} />
            ) : (
              <Eye size={15} color={colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  row: {
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
  rowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    paddingVertical: 10,
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginTop: -4,
    marginBottom: 6,
  },
});
