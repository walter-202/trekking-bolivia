import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Play,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react-native';
import { runAllUnitTests } from '../../../tests/domain.test';
import { AndeanTheme } from '../../theme';

interface NativeUnitTestViewProps {
  onBack: () => void;
}

export const NativeUnitTestView: React.FC<NativeUnitTestViewProps> = ({ onBack }) => {
  const [testResults, setTestResults] = useState(() => runAllUnitTests());
  const [lastRun, setLastRun] = useState<Date>(new Date());

  const handleRunTests = () => {
    const results = runAllUnitTests();
    setTestResults(results);
    setLastRun(new Date());
  };

  const allPassed = testResults.every((t) => t.passed);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back Button */}
      <Pressable onPress={onBack} style={styles.btnBack}>
        <ArrowLeft size={18} color="#34D399" />
        <Text style={styles.btnBackText}>Volver a Explorar</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <FlaskConical size={24} color="#10B981" />
        </View>
        <Text style={styles.title}>Runner de Pruebas Unitarias</Text>
        <Text style={styles.subtitle}>
          Verificación de algoritmos de dominio y esquemas Zod (Clean Architecture)
        </Text>
      </View>

      {/* Summary Banner */}
      <View
        style={[
          styles.summaryBanner,
          allPassed ? styles.summaryBannerSuccess : styles.summaryBannerFail,
        ]}
      >
        {allPassed ? (
          <CheckCircle2 size={24} color="#34D399" />
        ) : (
          <XCircle size={24} color="#EF4444" />
        )}
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryTitle}>
            {allPassed ? '100% de Pruebas Aprobadas (4/4)' : 'Se detectaron fallos en pruebas'}
          </Text>
          <Text style={styles.summarySub}>
            Última ejecución: {lastRun.toLocaleTimeString()}
          </Text>
        </View>
      </View>

      {/* Re-run Button */}
      <Pressable onPress={handleRunTests} style={styles.btnRun}>
        <Play size={16} color="#FFFFFF" />
        <Text style={styles.btnRunText}>Ejecutar Suite de Pruebas Nuevamente</Text>
      </Pressable>

      {/* Test List */}
      <Text style={styles.sectionTitle}>Detalle de Pruebas de Dominio</Text>

      {testResults.map((test, idx) => (
        <View key={idx} style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={styles.testTitleRow}>
              {test.passed ? (
                <CheckCircle2 size={16} color="#34D399" />
              ) : (
                <XCircle size={16} color="#EF4444" />
              )}
              <Text style={styles.testName}>{test.name}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                test.passed ? styles.statusSuccess : styles.statusFail,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: test.passed ? '#34D399' : '#EF4444' },
                ]}
              >
                {test.passed ? 'PASÓ' : 'FALLÓ'}
              </Text>
            </View>
          </View>

          <Text style={styles.testMsg}>{test.message}</Text>
        </View>
      ))}
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
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0A241C',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 280,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  summaryBannerSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  summaryBannerFail: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '700',
  },
  summarySub: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
  btnRun: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  btnRunText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  testCard: {
    backgroundColor: '#0E2E24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 12,
    marginBottom: 10,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  testName: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusFail: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  testMsg: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 16,
  },
});
