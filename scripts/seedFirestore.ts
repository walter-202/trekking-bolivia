/**
 * Cloud Firestore Seed Script for Trekking Bolivia Pro
 * Populates initial Administrator accounts and iconic Bolivian routes.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../src/infrastructure/firebase/config';
import { SEED_BOLIVIA_ROUTES } from '../src/core/domain/seedData';
import { SEED_ADMIN_ACCOUNTS } from '../src/infrastructure/auth/AuthContext';

async function seed() {
  console.log('🏔️ Iniciando poblado de Firestore para Trekking Bolivia Pro...\n');

  // 1. Seed Administrator Profiles
  console.log('👤 Sembrando Cuentas de Administrador:');
  for (const item of SEED_ADMIN_ACCOUNTS) {
    const profile = item.profile;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        username: profile.username || profile.email.split('@')[0],
        summitsCount: profile.summitsCount || 20,
        gpsAccuracy: profile.gpsAccuracy || '±1.5m Preciso',
        role: 'admin',
        isBlocked: false,
        createdAt: profile.createdAt || Date.now(),
      });
      console.log(`  ✅ Admin creado: ${profile.displayName} (${profile.email})`);
    } catch (err: any) {
      console.warn(`  ⚠️ Nota para ${profile.email}: ${err?.message || err}`);
    }
  }

  // 2. Seed Iconic Bolivian Routes
  console.log('\n🗺️ Sembrando Rutas Topográficas de Bolivia:');
  for (const route of SEED_BOLIVIA_ROUTES) {
    try {
      const routeRef = doc(db, 'routes', route.id);
      await setDoc(routeRef, {
        ...route,
        status: 'published',
        createdAt: route.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
      console.log(`  ✅ Ruta sembrada: ${route.title} (${route.distanceKm} km, +${route.elevationGainM || 1200}m)`);
    } catch (err: any) {
      console.warn(`  ⚠️ Nota para ruta ${route.id}: ${err?.message || err}`);
    }
  }

  console.log('\n🎉 ¡Poblado inicial finalizado con éxito!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error durante el poblado:', error);
  process.exit(1);
});
