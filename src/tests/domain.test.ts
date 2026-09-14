import {
  calculateHaversineDistanceKm,
  calculateTrackDistanceKm,
  suggestRouteDifficulty,
  calculateOfflineSizeMB,
} from '../core/domain/calculations';
import { RouteCreationSchema, ActivityLogSchema } from '../infrastructure/api/schemas';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export function runAllUnitTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Haversine distance accuracy
  try {
    // La Paz (-16.5, -68.15) to Yanacachi (-16.3982, -67.7421) is ~45 km
    const dist = calculateHaversineDistanceKm(-16.5, -68.15, -16.3982, -67.7421);
    const passed = dist > 40 && dist < 50;
    results.push({
      name: 'Haversine Great-Circle Distance',
      passed,
      message: `Distancia calculada: ${dist} km (esperada entre 40 y 50 km)`,
    });
  } catch (err: any) {
    results.push({ name: 'Haversine Great-Circle Distance', passed: false, message: err.message });
  }

  // Test 2: Difficulty algorithm (RF-32)
  try {
    const diff1 = suggestRouteDifficulty(5, 120); // < 8km -> facil
    const diff2 = suggestRouteDifficulty(15, 250); // 8-18km -> moderado
    const diff3 = suggestRouteDifficulty(30, 480); // 18-35km -> dificil
    const diff4 = suggestRouteDifficulty(55, 1200); // > 35km -> experto
    const passed =
      diff1 === 'facil' &&
      diff2 === 'moderado' &&
      diff3 === 'dificil' &&
      diff4 === 'experto';
    results.push({
      name: 'Algoritmo de Dificultad Andina (RF-32)',
      passed,
      message: `Clasificaciones: [${diff1}, ${diff2}, ${diff3}, ${diff4}] verificadas`,
    });
  } catch (err: any) {
    results.push({ name: 'Algoritmo de Dificultad Andina', passed: false, message: err.message });
  }

  // Test 3: Offline Size Calculation (RF-10)
  try {
    const size = calculateOfflineSizeMB(100, 5, 2);
    const passed = size > 10 && size < 15;
    results.push({
      name: 'Estimador de Tamaño de Descarga Offline (RF-10)',
      passed,
      message: `Tamaño estimado: ${size} MB (en rango esperado 10 - 15 MB)`,
    });
  } catch (err: any) {
    results.push({ name: 'Estimador de Tamaño de Descarga Offline', passed: false, message: err.message });
  }

  // Test 4: Zod Route Validation
  try {
    const validRoute = {
      title: 'Ruta Takesi Incaica',
      description: 'Hermosa travesía andina precolombina de alta montaña a Yungas.',
      region: 'La Paz, Bolivia',
      startPoint: { name: 'Ventilla', lat: -16.5385, lng: -67.8924 },
      endPoint: { name: 'Yanacachi', lat: -16.3982, lng: -67.7421 },
      distanceKm: 42.5,
      durationMinutes: 1080,
      difficulty: 'moderado' as const,
      modality: 'acompañado' as const,
      isPrivate: false,
      status: 'published' as const,
      waypoints: [],
      checkpoints: [],
      photos: [],
    };
    const validParse = RouteCreationSchema.safeParse(validRoute);

    const invalidRoute = {
      title: 'No', // Too short
      distanceKm: -5, // Negative
    };
    const invalidParse = RouteCreationSchema.safeParse(invalidRoute);

    const passed = validParse.success && !invalidParse.success;
    results.push({
      name: 'Validación de Esquema de Rutas con Zod',
      passed,
      message: passed
        ? 'Ruta válida aprobada y datos inconsistentes rechazados con error de esquema'
        : 'Fallo en validación de esquema',
    });
  } catch (err: any) {
    results.push({ name: 'Validación de Esquema de Rutas con Zod', passed: false, message: err.message });
  }

  return results;
}
