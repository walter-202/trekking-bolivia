---
description: Flujo TDD de dominio (red-green-refactor sobre cálculos y schemas)
agent: build
---

Aplica TDD sobre $ARGUMENTS (cálculo geo o schema Zod):

1. Escribe primero el caso que falla en `src/tests/domain.test.ts` (Haversine, RF-32, `calculateOfflineSizeMB`, schemas).
2. Implementa lo mínimo en `src/core/domain/` o `src/infrastructure/api/schemas.ts` (TS puro, funciones puras, sin RN/Expo/Firebase en dominio).
3. Corre `npm test` y `npm run lint` hasta verde + 0 errores. Reporta casos añadidos y resultado.
