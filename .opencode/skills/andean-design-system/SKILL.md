---
name: andean-design-system
description: Andean visual system for native screens — AndeanTheme tokens, component recipes, form/drawer specs, and anti-slop guardrails for Trekking Bolivia
license: MIT
compatibility: opencode
metadata:
  audience: trekking-bolivia-team
  source: DESIGN_RULES.md
---

# Andean Design System (nativo)

Fuente: `DESIGN_RULES.md` + `src/presentation/theme.ts`. `AndeanTheme` es la ÚNICA fuente de verdad. Cero hex/espaciado/tipo hardcodeado fuera de `theme.ts`.

## Tokens

- **Fondos:** `background #051712`, `backgroundSecondary #06231B`, `card #0E2E24`, `cardElevated #153E32`, `overlay rgba(5,23,18,0.85)`.
- **Bordes:** `border #1A4537` (alias doc: `#12382c`), `borderLight #265D4B`. 1px, sin sombras pesadas.
- **Acción:** CTA `primaryDark #059669` sobre `#064e3b` (hover `#043e2f`); acento vivo `primary #10B981` / `primaryLight #34D399` (En Vivo, tabs activos, anillos avatar); oro `amber #D97706` / `amberLight #F59E0B` (logros, guías); peligro `danger #EF4444` / `dangerDark #DC2626` (grabación, SOS, salir).
- **Texto (dark-only):** `text #F9FAFB`, `textSecondary #9CA3AF`, `textMuted #6B7280`. Titulares `extrabold 22-28 tracking-tight`.
- **Tipo:** `System`; tamaños 11/13/15/18/22/28. Micro-labels de formulario: 10px bold uppercase tracking-wider, siempre ARRIBA del campo.
- **Espaciado:** 4/8/12/16/24/32. **Radios:** 8/12/16/24/full (hojas `rounded-t-[32px]` → `borderTopLeft/RightRadius: 32`).

## Recetas

- **Inputs:** icono `lucide-react-native` a la izquierda, toggle contextual a la derecha (ojo en password), borde `borderLight`, foco en `#059669`. Placeholder con ejemplo real (`andino@trekbolivia.bo`, `@caminante_bolivia`, `Mínimo 8 caracteres`).
- **CTA principal:** esmeralda profundo, texto blanco + flecha `→`, altura ≥ 48, estado loading con spinner (no doble submit).
- **Pills:** `TREK-BOLIVIA PRO v2.4` en verde translúcido con borde; `● En Vivo` verde; `SOS` rojo; contadores (12, 3 Activas) como badges.
- **Drawer (≥60% viewport, ref 78%):** header logo + `ANDEAN TOPO GUIDE` + X; ficha usuario (avatar con anillo+pulse, nombre ✓, `@handle`, badge oro `Guía de Montaña`, mini-cards `Cumbres` / `GPS Fix ±2.4m`); secciones Exploración + Herramientas Pro; tarjeta offline (`4.2 GB / 64 GB` + barra verde + `sincronizada ✓`); footer Ajustes/Salir + `v2.8.4 Andean Engine ● Conectado`.
- **Hojas claras:** `white #FFFFFF` sobre fondo oscuro, campos `Canvas Soft Tint`, foco verde.

## Reutilizar antes de crear (obligatorio)

Casa de primitivas nativas: `src/presentation/components/native/` (API pública en su `index.ts`:
`Button`, `Field`, `Banner`). `ui/` es web (div/button) y NO se usa en nativo.

1. ¿Existe en `components/native/index.ts`? Úsalo.
2. Si no: `grep` en `views/` por si otro feature ya lo resolvió → extrae el común, no copies.
3. Nueva primitiva solo por Regla de Tres o token del sistema, con variantes explícitas
   (`tone: 'error' | 'success'`, nunca booleanos encadenados) y `accessibilityLabel`.
4. Lo de un solo uso se queda colocalizado en `views/<feature>/` (ver `CLEAN_ARCH_RULES.md).

## Skills externas de componentización (no reinventar)

Instalar una vez por máquina con `npx skills`:

| Skill | Cuándo cargarla |
|---|---|
| `expo-design-system` (de `npx skills add expo/skills`) | Crear/ordenar tokens y theme, librería de componentes, auditar drift (hex fuera del theme) |
| `vercel-composition-patterns` (de `npx skills add vercel-labs/agent-skills --skill composition-patterns`) | Diseñar APIs de componentes: compound components, evitar boolean props, variantes explícitas |
| `react-native-skills` — reglas `design-system-compound-components`, `ui-*` (mismo repo vercel) | Patrones RN concretos: `Pressable` sobre `TouchableOpacity`, `expo-image`, safe-area, menús/modales nativos |
| `expo-native-ui` | Que la pantalla se sienta nativa (HIG, controles, SF Symbols) |
| `expo-ui-full-reference` (de `npx skills add AlshehriAli0/agent-skills`) | Referencia total de `@expo/ui` (SwiftUI/Compose real) |

## Controles nativos

Sheets, pickers, sliders, toggles, menús, form-sections → `@expo/ui` (SwiftUI/Compose real). Excepción: listas de datos → `FlatList`/`FlashList` (`@expo/ui` List NO virtualiza).

## Anti-slop (falla review)

`.opacity-traslúcido` genérico sin token, gradientes morado-azul, placeholders grises "lorem", paleta de un solo hue, sombras pesadas, `className`/`div` en código nativo, prefijo `Native*` en archivos nuevos, hex fuera de `theme.ts`, repetir un estilo 3× sin extraerlo a componente compartido.
