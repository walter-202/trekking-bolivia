# CLEAN_ARCH_RULES.md — Clean Architecture + Screaming Architecture (Trekking Bolivia)

> Híbrido pragmático: **Clean por dentro** (dependencias hacia adentro, dominio puro) + **features por fuera**
> (UI colocalizada por capacidad de negocio). Nada de big-bang rewrites: migración incremental, un feature por vez.

## 1. Regla de dependencia (innegociable)

```
core/domain  ←  infrastructure  ←  presentation
   (puro)         (adaptadores)      (UI + composición)
```

- `src/core/domain/`: TypeScript puro. Cero imports de `react-native`, `expo`, `firebase`, `window`.
  Solo entidades, cálculos puros (`calculations.ts`), seed y tipos.
- `src/infrastructure/`: adaptadores (Firestore, Auth, AsyncStorage vía `storage.ts`, Zod en `api/`).
  Firebase se inicializa SOLO en `firebase/config.ts`.
- `src/presentation/`: compone. Nunca contiene reglas de negocio ni validación manual
  (toda validación externa pasa por Zod en `infrastructure/api/schemas.ts`).

## 2. Screaming + colocalización (adaptado a este repo)

La estructura debe gritar el negocio (auth, explore, record…), no la tecnología.
Dentro de `presentation/`, el código que cambia junto vive junto:

## 2b. Nombres: prohibido el prefijo `Native*`

El prefijo `Native*` fue un error histórico (nació porque la versión web ocupaba el nombre
canónico con `div`/HTML). Reglas:

- Un concepto = un nombre canónico: `AuthView`, `Button`, `LoginForm`. Sin prefijos de plataforma.
- La plataforma se separa por **carpeta**, no por nombre: `components/native/Button.tsx`
  (nativo) vs `components/ui/Button.tsx` (web legacy). El `index.ts` de cada carpeta es la vía de import.
- Gemelos web legacy (`*View.tsx` con HTML, `TrekkingMap`, `AuthModal`…): no se tocan ni se
  imitan. Al migrar un feature, el nativo toma el nombre canónico y el web pasa a
  `*.legacy.tsx` (o se elimina si ya nadie lo importa — verificar con grep antes).
- `grep` obligatorio antes de nombrar: si el nombre ya existe en web legacy, aplica el punto anterior.
- Viola review: cualquier archivo nuevo `Native*`, o importar `ui/` (web) desde código nativo.

```
presentation/
├── theme.ts                          # ÚNICA fuente visual (tokens)
├── components/native/                # Primitivas genuinamente compartidas (index.ts público)
│   ├── Button.tsx / Field.tsx / Banner.tsx
│   └── index.ts                      # ← API pública; el resto importa desde aquí
└── views/auth/                       # Feature auth: lo de un solo uso vive AQUÍ
    ├── AuthView.tsx                  # Compositor delgado (tabs + qué form mostrar)
    ├── LoginForm.tsx                 # Dueño de su estado + validación + submit
    ├── RegisterForm.tsx
    └── SeedAccountsCard.tsx          # Solo auth lo usa → no va a components/
```

- **Vista = compositor** (presupuesto: ~150 líneas): layout, navegación, qué pieza mostrar.
  Sin estado de negocio, sin llamadas directas a servicios salvo pasar callbacks.
- **Form/componente de feature**: dueño de su estado, su validación (Zod) y su submit.
- **Regla de colocalización**: si solo un lugar lo usa → vive en ese archivo/carpeta.
  Si dos lugares lo usan → vigílalo. Si tres → recién ahí sube a `components/native/`
  (**Regla de Tres**: no crear "reutilizable" prematuro).
- **API pública**: cada carpeta compartida expone `index.ts`; nadie importa internos profundos.
  Si refactorizas por dentro, los imports externos no se rompen.

## 3. Reutilizar antes de crear (anti-reinvención)

Antes de escribir un input, botón, banner, card o empty-state:

1. Mira `components/native/index.ts` — ¿ya existe? Úsalo.
2. `grep` en `views/` — ¿otro feature ya lo resolvió? Extrae el común a `native/`, no copies.
3. ¿Es patrón de composición (variantes, compound)? Carga `vercel-composition-patterns`
   y `expo-design-system` antes de diseñar la API (ver `andean-design-system`).
4. Nueva primitiva solo si pasa la Regla de Tres o es token del design system.
   Toda primitiva nueva sale con sus variantes explícitas (`tone: 'error' | 'success'`,
   no booleanos encadenados) y con `accessibilityLabel`.

## 4. Estado y datos

- Global solo en `useTrekkingStore` (Zustand + AsyncStorage). Estado de formulario = local al form.
- Server/Firestore solo vía servicios de `infrastructure/database/`. RBAC se chequea en
  servicio + `firestore.rules`, nunca solo ocultando botones.
- Offline-first: `calculateOfflineSizeMB()` → confirmar → guardar trazado + waypoints + tiles.

## 5. Cumplimiento

- `/plan` exige contrastar HU vs código antes de codificar; el Protocolo HU (AGENTS.md)
  obliga a preguntar si el doc está desactualizado.
- `@clean-arch-guardian` audita diffs contra este archivo (solo lectura, tabla de hallazgos).
- Piloto migrado: `views/auth/` (forms separados + primitivas `native/`).
  Siguiente: aplicar el mismo patrón a `views/record/` y `views/explore/` cuando se toquen.
