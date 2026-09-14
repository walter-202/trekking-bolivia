import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CheckCircle2, XCircle, FlaskConical, RotateCcw, ArrowLeft } from 'lucide-react-native';
import { runAllUnitTests, TestResult } from '../../../tests/domain.test';

interface UnitTestViewProps {
  onBack: () => void;
}

export const UnitTestView: React.FC<UnitTestViewProps> = ({ onBack }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const execute = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResults(runAllUnitTests());
      setIsRunning(false);
    }, 200);
  };

  useEffect(() => {
    execute();
  }, []);

  const allPassed = results.length > 0 && results.every((r) => r.passed);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={18} color="#059669" />
          <Text style={styles.backButtonText}>Volver a la App</Text>
        </Pressable>
        <Pressable onPress={execute} disabled={isRunning} style={styles.retryButton}>
          <RotateCcw size={14} color="#ffffff" />
          <Text style={styles.retryButtonText}>
            {isRunning ? 'Ejecutando...' : 'Reejecutar'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTitleRow}>
            <View style={styles.iconBox}>
              <FlaskConical size={20} color="#10b981" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Pruebas Unitarias del Frontend</Text>
              <Text style={styles.heroSubtitle}>Clean Architecture & Dominio Geoespacial</Text>
            </View>
          </View>
          <Text style={styles.heroDescription}>
            Verificación automatizada de fórmulas trigonométricas de gran círculo (Haversine), clasificación de dificultad andina (RF-32), estimador de caché offline (RF-10) y esquemas Zod.
          </Text>
        </View>

        {/* Global summary badge */}
        {allPassed && (
          <View style={styles.allPassedCard}>
            <CheckCircle2 size={20} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.allPassedTitle}>
                ¡Todas las pruebas pasaron con éxito! ({results.length}/{results.length})
              </Text>
              <Text style={styles.allPassedSubtitle}>
                El motor matemático y las reglas de negocio están 100% operativos.
              </Text>
            </View>
          </View>
        )}

        {/* Test Cards List */}
        <View style={styles.resultsList}>
          {results.map((res, idx) => (
            <View
              key={idx}
              style={[
                styles.resultCard,
                res.passed ? styles.passedCard : styles.failedCard,
              ]}
            >
              <View style={styles.resultHeader}>
                {res.passed ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : (
                  <XCircle size={18} color="#e11d48" />
                )}
                <Text style={styles.resultName}>{res.name}</Text>
                <View
                  style={[
                    styles.statusPill,
                    res.passed ? styles.statusPillPassed : styles.statusPillFailed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      res.passed ? styles.statusPillTextPassed : styles.statusPillTextFailed,
                    ]}
                  >
                    {res.passed ? 'PASÓ' : 'FALLÓ'}
                  </Text>
                </View>
              </View>
              <Text style={styles.resultMessage}>{res.message}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#064e3b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#051712',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#12382c',
    gap: 10,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 10,
    color: '#6ee7b7',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  heroDescription: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  allPassedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: 14,
  },
  allPassedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065f46',
  },
  allPassedSubtitle: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  resultsList: {
    gap: 10,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passedCard: {
    borderColor: '#e2e8f0',
  },
  failedCard: {
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillPassed: {
    backgroundColor: '#d1fae5',
  },
  statusPillFailed: {
    backgroundColor: '#ffe4e6',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusPillTextPassed: {
    color: '#047857',
  },
  statusPillTextFailed: {
    color: '#be123c',
  },
  resultMessage: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
});
