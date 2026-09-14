---
description: Planificar feature HU con Clean Architecture antes de codificar
agent: build
---

Actúa en modo plan (no edites archivos todavía).

0. Protocolo HU (obligatorio si $ARGUMENTS toca una HU-01…HU-10): lee su sección en
   `USER_STORIES.md` y contrasta criterios vs código real. Si el doc está
   desactualizado o el criterio es ambiguo, PREGUNTA al usuario (tool `question`)
   antes de seguir. Doc desactualizado = plan bloqueado hasta confirmar.
1. Lee `USER_STORIES.md`, `EXPO_GUIDE.md` y los archivos implicados en $ARGUMENTS.
2. Alcance estricto: cada campo/botón propuesto debe citar su criterio (`HU-0X Cn`).
   Lo que no esté pedido no se incluye; si parece necesario, se pregunta, no se asume.
2. Propón: archivos a crear/editar por capa (`core/domain` → `infrastructure` → `presentation`), schemas Zod nuevos, cambios de store, permisos/OTA vs rebuild si aplica, y criterios de aceptación verificables.
3. Pregunta lo ambiguo antes de codificar. Termina con plan numerado + comando de verificación (`npm run lint`, `npm test`).
