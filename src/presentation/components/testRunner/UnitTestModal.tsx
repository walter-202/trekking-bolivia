import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle2, XCircle, FlaskConical, RotateCcw } from 'lucide-react-native';
import { runAllUnitTests, TestResult } from '../../../tests/domain.test';

export const UnitTestModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const execute = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResults(runAllUnitTests());
      setIsRunning(false);
    }, 250);
  };

  useEffect(() => {
    if (isOpen) {
      execute();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allPassed = results.length > 0 && results.every((r) => r.passed);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <FlaskConical size={18} color="#047857" />
              <Text style={styles.title}>Pruebas Unitarias del Frontend</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.description}>
            Verificación automatizada de algoritmos de cálculo de distancia (Haversine), clasificación de dificultad andina (RF-32), tamaño offline (RF-10) y esquemas Zod.
          </Text>

          {/* Results list */}
          <ScrollView style={styles.resultsScroll}>
            {results.map((res, idx) => (
              <View
                key={idx}
                style={[
                  styles.resultItem,
                  res.passed ? styles.passedItem : styles.failedItem,
                ]}
              >
                {res.passed ? (
                  <CheckCircle2 size={16} color="#059669" />
                ) : (
                  <XCircle size={16} color="#e11d48" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{res.name}</Text>
                  <Text style={styles.resultMessage}>{res.message}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {allPassed && (
            <View style={styles.allPassedBox}>
              <Text style={styles.allPassedText}>
                ✓ Todas las pruebas unitarias pasaron con éxito ({results.length}/{results.length})
              </Text>
            </View>
          )}

          <View style={styles.footerRow}>
            <Pressable
              onPress={execute}
              disabled={isRunning}
              style={styles.retryBtn}
            >
              <RotateCcw size={14} color="#334155" />
              <Text style={styles.retryBtnText}>
                {isRunning ? 'Ejecutando...' : 'Reejecutar'}
              </Text>
            </Pressable>

            <Pressable onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    maxWidth: 420,
    width: '100%',
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  description: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  resultsScroll: {
    maxHeight: 260,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  passedItem: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  failedItem: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  resultName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultMessage: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  allPassedBox: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  allPassedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  doneBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  doneBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
