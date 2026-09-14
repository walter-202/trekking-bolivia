---
name: expo-sdk57-guide
description: Expos SDK 57 workflow for this repo — managed workflow, permissions, EAS OTA vs rebuild, maps/GPS/storage adapters, and which official expo and eas skill to load next
license: MIT
compatibility: opencode
metadata:
  audience: trekking-bolivia-team
  stack: expo-57-rn-0.86
---

# Expo SDK 57 Guide (Trekking Bolivia)

Repo pinnado: `expo@57.0.22` · `react-native@0.86.3` · `react@19.2.3` · New Architecture. Managed workflow — NO eject.

## Reglas compartidas (siempre aplican)

- Nativo solo vía Expo Modules API o config plugins. Nada de `react-native link`.
- Cambio en `app.json` / `eas.json` / deps nativas / permisos → correr `npx expo-doctor` y declarar **OTA vs rebuild**: `eas-update` = solo JS/assets; cambio nativo/permiso/versión SDK = rebuild + submit.
- Ante la duda, probar primero en Expo Go antes de `expo run:ios/android` o `eas build`.
- Permisos `expo-location` solo en contexto (iniciar/grabar actividad) con explicación. Respetar `NSLocationWhenInUseUsageDescription` y permisos Android ya declarados.

## Adaptadores de este repo (web → nativo)

| Web actual | Nativo correcto |
|---|---|
| `localStorage` | `AsyncStorage` vía `src/infrastructure/persistence/storage.ts` |
| IndexedDB (`tileCacheDB.ts`) | `expo-file-system` + `expo-sqlite` (misma interfaz repo) |
| `window` / `document` | prohibido en código nativo; usar APIs Expo/RN |
| Leaflet directo | solo dentro de `react-native-webview`, o migrar a `react-native-maps` / MapLibre |
| Google login web | `expo-auth-session` o `@react-native-google-signin` |

## Router de skills oficiales (instalar 1 vez por máquina)

```bash
npx skills add expo/skills
```

Cargar bajo demanda DESPUÉS de esta skill, según la tarea:

| Tarea | Skill oficial |
|---|---|
| Duda general / "¿por dónde empiezo?" / setup | `expo-overview` (primero, es el router) |
| Tabs, stacks, modales, deep links | `expo-router` |
| Pantalla que se vea nativa (HIG, controles, SF Symbols) | `expo-native-ui` |
| Theme/tokens, librería de componentes, drift de diseño | `expo-design-system` |
| Cualquier animación, gesto, sheet, háptico | `expo-animation` |
| Fetch/API, React Query, caché, offline, loaders | `expo-data-fetching` |
| Migrar pantalla web a nativa | `expo-web-to-native` (`expo-dom` solo para el mecanismo puntual) |
| Crear módulo nativo Swift/Kotlin | `expo-module` |
| UI con `@expo/ui` (SwiftUI/Compose real) | `expo-ui` |
| Subir a TestFlight / Play, signing, releases | `eas-app-stores` |
| OTA JS/assets | `eas-update` (+ `eas-update-insights` para salud del rollout) |
| CI/CD pipelines | `eas-workflows` |
| Subir SDK / deps rotas | `expo-upgrade` |
| Dev clients internos | `expo-dev-client` |

Fuente de verdad: docs Expo + Expo CLI + EAS CLI. Si una skill oficial contradice este archivo en algo del repo (rutas de archivos, RBAC, AndeanTheme), gana el repo y se reporta con `npx submit-expo-feedback`.
