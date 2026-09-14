# Guía de Exportación y Compatibilidad con Expo (React Native)

Este proyecto fue diseñado bajo los principios de **Clean Architecture**, lo que permite exportar y reutilizar la gran mayoría de la lógica de negocio directamente en **Expo (React Native)**.

---

## 1. Código Incompatible Eliminado

- **`express` & `@types/express`**: Eliminados completamente. Las aplicaciones móviles en Expo se comunican directamente con Firebase / Firestore mediante el SDK de cliente.
- **`server.ts`**: Eliminado. No se requiere ningún servidor Node.js intermedio; las llamadas se realizan directamente a través de `userProfileService`, `routeService` y `activityService`.
- **Rutas `/api/*`**: Reemplazadas por llamadas directas al SDK de Firestore.

---

## 2. Compatibilidad por Capas de la Arquitectura

| Capa | Estado para Expo | Observaciones |
|---|---|---|
| **`src/core/domain/`** | **100% Compatible** | TypeScript puro (`types.ts`, `calculations.ts`, `seedData.ts`). Sin dependencias de DOM ni Node.js. |
| **`src/infrastructure/database/`** | **100% Compatible** | Servicios de Firestore (`routeService.ts`, `activityService.ts`, `userProfileService.ts`). Compatibles con `firebase` JS SDK y `@react-native-firebase`. |
| **`src/infrastructure/api/schemas.ts`** | **100% Compatible** | Validaciones con `zod`, funciona de forma idéntica en React Native. |
| **`src/infrastructure/auth/AuthContext.tsx`** | **95% Compatible** | Lógica de sesión y sincronización en tiempo real con Firestore. En móvil, el login con Google se gestiona con `expo-auth-session` o `@react-native-google-signin`. |
| **`src/infrastructure/persistence/`** | **Adaptador Requerido** | Cambiar `localStorage` por `@react-native-async-storage/async-storage` y `IndexedDB` por `expo-file-system` o `expo-sqlite`. |
| **`src/presentation/components/map/`** | **Adaptador Requerido** | Leaflet se puede ejecutar dentro de `react-native-webview` (manteniendo la misma caché de mapas) o migrar a `@maplibre/maplibre-react-native` / `react-native-maps`. |
| **Componentes de UI** | **Adaptador Requerido** | Reemplazar elementos HTML (`div`, `button`, etc.) por primitivas de React Native (`View`, `Text`, `Pressable`) usando **NativeWind** para mantener las clases de Tailwind. |

---

## 3. Pasos Rápidos para Inicializar en Expo

1. **Crear el proyecto Expo**:
   ```bash
   npx create-expo-app TrekkingBoliviaMobile --template blank-typescript
   ```

2. **Copiar las carpetas de dominio e infraestructura**:
   ```bash
   cp -r src/core TrekkingBoliviaMobile/src/
   cp -r src/infrastructure/database TrekkingBoliviaMobile/src/infrastructure/
   cp -r src/infrastructure/api TrekkingBoliviaMobile/src/infrastructure/
   ```

3. **Instalar paquetes recomendados en Expo**:
   ```bash
   npx expo install firebase @react-native-async-storage/async-storage expo-location expo-file-system zod zustand
   ```
