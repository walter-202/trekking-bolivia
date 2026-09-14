---
description: Crear pantalla nativa andina (Native* + theme) desde nombre
agent: build
---

Crea la pantalla $ARGUMENTS siguiendo el sistema andino:

1. Carga `skill({ name: "andean-design-system" })` y lee `src/presentation/theme.ts` + la Native* de referencia más cercana en `src/presentation/views/`.
2. Implementa `Native$ARGUMENTSView` con `View/Text/Pressable/TextInput/FlatList` + `StyleSheet` + `AndeanTheme` (cero hex fuera del theme, `SafeAreaView`, targets ≥ 44pt, `accessibilityLabel` en acciones).
3. Lógica fuera de la vista: validación con Zod (`src/infrastructure/api/schemas.ts`), estado en `useTrekkingStore`, cálculos en `core/domain`.
4. Cierra con `npm run lint`. Si tocaste permisos/deps nativas, suma `npx expo-doctor`.
