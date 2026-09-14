---
name: native-ux-patterns
description: Mobile UX for Trekking Bolivia — state matrix, offline-first downloads, GPS permission flows, touch targets, accessibility, and RN performance rules
license: MIT
compatibility: opencode
metadata:
  audience: trekking-bolivia-team
  areas: offline-gps-a11y-performance
---

# Native UX Patterns (Trekking Bolivia)

## 1. Matriz de estados (toda pantalla/flujo la implementa)

| Estado | Patrón |
|---|---|
| Loading | skeleton o spinner + texto ("Buscando rutas…"), sin pantalla en blanco |
| Empty | ilustración/icono + titular + CTA ("Aún no hay descargas — Explorar rutas") |
| Error | qué pasó + reintentar ("Sin conexión. Reintentar") |
| Partial | contenido disponible + aviso de lo que falta |
| Offline | banner persistente + rutas descargadas marcadas `✓ Descargada Offline` |

Copy en español claro, con siguiente acción. Acciones destructivas (rechazar ruta, bloquear usuario) → confirmación + motivo obligatorio (`moderationNotes`).

## 2. Offline-first (HU-04)

Flujo: `Descargar ruta` → estimar con `calculateOfflineSizeMB()` → mostrar MB → confirmar → guardar trazado+waypoints+tiles en `AsyncStorage`/`expo-file-system` → notificar `✓ Descargada Offline`. Nunca descargar tiles sin confirmación de tamaño. Dashboard: `X GB / 64 GB` + barra + `sincronizada ✓`.

## 3. GPS y permisos (HU-06/HU-08)

Pedir `expo-location` SOLO al iniciar/grabar actividad, explicando por qué ("registro topográfico y rescate SOS"). Cubrir: denegado (cómo habilitarlo), sin señal (modo offline + reintento), precisión visible (`GPS Fix ±2.4m`). Cronómetro + métricas en vivo (distancia, desnivel, tiempo), pausar/reanudar, finalizar con % completado. Dificultad auto con `suggestRouteDifficulty()`.

## 4. Touch + accesibilidad

Targets ≥ 44pt, `SafeAreaView` siempre, dark-mode only. `accessibilityLabel` + `accessibilityRole` en toda acción; foco visible; contraste AA sobre `#051712`; Dynamic Type sin truncar (nada de alturas fijas que corten texto); iconos lucide con significado, no solo decoración.

## 5. Performance RN (aplica siempre)

- Listas: `FlatList`/`FlashList` con `keyExtractor`, `getItemLayout` o `windowSize`/`removeClippedSubviews`; jamás `.map()` de cientos de items en `ScrollView`.
- Imágenes: `expo-image` con caché + blurhash; evita re-render con `memo`/`useCallback` en rows.
- Animación: Reanimated 3 en UI thread + Gesture Handler; nada de `Animated.timing` en JS para gestos; hápticos con `expo-haptics`.
- Navegación: stacks nativos; `Link` con previews donde ayude; evita modales invasivos (pantallas dedicadas como en este repo).

## Cuándo escalar a skills externas

- Listas/animación/imágenes al límite → `vercel react-native-skills` (`npx skills add vercel-labs/agent-skills --skill react-native-skills`).
- Theming con Unistyles / referencia total `@expo/ui` → `npx skills add AlshehriAli0/agent-skills`.
- Dirección de arte / variantes visuales → OJO Design Skills o `osmontero/opencode-skills` (`designing-frontend-interfaces`, `designing-user-experience`, `reviewing-interface-quality`).
