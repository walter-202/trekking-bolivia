# AGENTS.md — Trekking Bolivia Pro (Expo SDK 57 + React Native)

> Instrucciones canónicas para agentes OpenCode. Todos en el equipo usan OpenCode con esta config.
> Stack: `expo@57.0.22` · `react-native@0.86.3` · `react@19.2.3` · TypeScript strict · Zustand + AsyncStorage · Firebase/Firestore · Zod · `expo-location` · `expo-file-system`.

## Comandos (usar en este orden)

```bash
npm start          # Metro Bundler interactivo
npm run android    # Android (emulador / dispositivo)
npm run ios        # iOS (solo macOS)
npm run web        # Web (Metro)
npm run lint       # tsc --noEmit — debe quedar en 0 errores
npm test           # Suite dominio TDD (Haversine, RF-32, Zod) — debe quedar verde
npx expo-doctor    # Salud Expo SDK 57 (21 checks) — antes de tocar app.json/eas.json/deps
```

Verificación mínima antes de dar por terminada una tarea: `npm run lint` + `npm test`. Si tocaste `app.json`, `eas.json`, deps nativas o permisos → suma `npx expo-doctor`.

## Protocolo HU (obligatorio — anti-rehacer tareas)

Antes de codificar CUALQUIER tarea ligada a una HU (HU-01…HU-10):

1. Lee la sección correspondiente en `USER_STORIES.md` (criterios + evidencia).
2. Contrasta doc vs código real (2 min): ¿los archivos de evidencia existen? ¿los criterios se cumplen?
3. **Si el doc está desactualizado o el criterio es ambiguo → PREGUNTA al usuario antes de codificar** (tool `question`): confirma qué versión vale. Nunca re-hagas ni re-interpretes en silencio.
4. Al terminar: actualiza la evidencia en `USER_STORIES.md` (archivos + schemas + tests) en el mismo commit del cambio.

Regla de oro: doc desactualizado = tarea bloqueada hasta confirmar. Rehacer por no preguntar es el fallo más caro del equipo.

## Arquitectura (Clean Architecture — respetar capas)

```
src/
├── core/domain/            # 100% TS puro, SIN imports de react-native/expo/firebase. types.ts, calculations.ts, seedData.ts
├── infrastructure/
│   ├── auth/               # AuthContext + RBAC (user | moderator | admin)
│   ├── api/                # schemas.ts (Zod) — única validación aceptada en bordes
│   ├── database/           # routeService, activityService, userProfileService (Firestore)
│   ├── firebase/           # config.ts — único lugar que inicializa Firebase
│   └── persistence/        # useTrekkingStore (Zustand+AsyncStorage), storage.ts, tileCacheDB, tileDownloader
├── presentation/
│   ├── theme.ts            # AndeanTheme — ÚNICA fuente de color/espaciado/tipo. No hardcodear hex fuera de aquí
│   ├── components/native|ui|map|navigation/  # Native* = RN puro; sin <div>/<button> HTML
│   └── views/explore|activity|record|moderation|profile|auth|testRunner/  # par Native* + Web cuando aplique
└── tests/domain.test.ts    # Tests solo de dominio + schemas
```

Reglas de dependencia: `presentation → infrastructure → core/domain`. `core/domain` nunca importa RN/Expo/Firebase. Validar todo input externo con Zod (`src/infrastructure/api/schemas.ts`). Estado global solo en `useTrekkingStore`; nada de `localStorage`/`window`/`document` en código nativo (usar `storage.ts` con AsyncStorage y `expo-file-system`/`expo-sqlite` para tiles).

## Convenciones obligatorias

- **Expo managed workflow. NO eject.** Módulos nativos solo vía Expo Modules API o config plugins. Nada de `react-native link`.
- **UI 100% nativa:** `View/Text/Pressable/TextInput/FlatList` + `StyleSheet` con `AndeanTheme`. Clases Tailwind web (`bg-[#051712]`) se traducen a `theme.ts`, no se pegan literales.
- **Seguro por defecto:** pedir `expo-location` solo en contexto (iniciar/grabar actividad), explicar por qué; respetar `NSLocationWhenInUseUsageDescription` en `app.json`. Roles RBAC: `user`, `moderator`, `admin` — moderación y gestión de usuarios solo con rol permitido; rechazos exigen `moderationNotes`.
- **Offline-first:** toda ruta descargable guarda trazado + waypoints + tiles; estimar MB con `calculateOfflineSizeMB()` y confirmar antes de descargar.
- **Mapas:** Leaflet vive solo dentro de `react-native-webview` o se migra a `react-native-maps`/`maplibre`. No importar `leaflet` en componentes nativos.
- **Estilo código:** TypeScript strict, `import type` para tipos, funciones puras en dominio, componentes pequeños, nombres en inglés para código y props.
- **Commits:** pequeños, en español o inglés consistente con el historial, sin secretos (`.env` jamás se commitea; ver `.env.example`).

## Diseño andino (resumen — detalle en DESIGN_RULES.md)

Fondo `#051712`, superficie `#082019`/`#0E2E24`, borde `#12382c` 1px sin sombras pesadas. CTA `#064e3b` (hover `#043e2f`), acento vivo `#10b981`/`#059669`, oro `#d97706`/`#f59e0b`, alerta `#ef4444`. Micro-labels `10px bold uppercase tracking-wider stone-500` sobre cada input; inputs con icono lucide a la izquierda. Touch targets ≥ 44pt, `SafeAreaView` siempre, dark-mode only (`userInterfaceStyle: dark`).

## Skills (cómo trabajar con ellas)

- El agente descubre skills vía tool `skill` y las carga bajo demanda. Antes de código Expo/RN/UI, cargar la skill local que corresponda:
  - `skill({ name: "expo-sdk57-guide" })` — SDK 57, permisos, EAS, OTA vs rebuild.
  - `skill({ name: "andean-design-system" })` — tokens, componentes, anti-slop.
  - `skill({ name: "native-ux-patterns" })` — estados, offline, GPS, a11y, performance.
- Skills oficiales externas (instalar una vez por máquina, requieren `npx skills`):
  ```bash
  npx skills add expo/skills                                   # oficiales Expo (expo-overview, expo-router, expo-native-ui, expo-design-system, expo-animation, expo-data-fetching, expo-upgrade, eas-*)
  npx skills add vercel-labs/agent-skills --skill react-native-skills   # performance RN (listas, Reanimated, imágenes)
  npx skills add AlshehriAli0/agent-skills                            # unistyles + expo-ui-full-reference (a elegir)
  ```
  Ver `.opencode/skills/*/SKILL.md` para el catálogo curado y cuándo usar cada una.
- Subagentes del proyecto (`.opencode/agents/`, invocar con `@nombre`): `@expo-native-expert`, `@andean-ui-designer`, `@mobile-ux-reviewer`, `@clean-arch-guardian`, `@qa-tdd-runner`.

## Docs fuente (leer bajo demanda, no todo de golpe)

- `DESIGN_RULES.md` — sistema visual completo (paleta, tipografía, drawer, formularios).
- `EXPO_GUIDE.md` — tabla de compatibilidad por capa y pasos de portabilidad.
- `USER_STORIES.md` — HU-01…HU-10 con criterios de aceptación y trazabilidad a archivos.
- `app.json` / `eas.json` — permisos, plugins (`expo-location`), perfiles build/submit.
- `firestore.rules` — antes de cambiar servicios de `database/`.

## Anti-patrones (fallan review)

1. Importar `leaflet`, `localStorage`, `window`, `document` o `express` en código nativo.
2. Hardcodear colores/espaciados fuera de `theme.ts` o usar `div/button/className` en `Native*`.
3. Lógica de negocio dentro de vistas; validación manual sin Zod; roles chequeados solo en UI sin respaldo en servicio/rules.
4. Cambiar versión nativa/SDK sin `expo-doctor` ni aclarar si requiere rebuild o basta OTA (`eas-update` = solo JS/assets).
5. Silenciar errores de `tsc`, `npm test` o `expo-doctor` en el reporte final.
