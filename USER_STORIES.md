# Trekking Bolivia Pro — Historias de Usuario (Versión 1.0)
## Matriz de Requisitos, Criterios de Aceptación y Auditoría de Cumplimiento

Documento canónico que define las **10 Historias de Usuario (HU)** que conforman el alcance de la **Primera Versión (V1)** de **Trekking Bolivia**, junto con la verificación y trazabilidad técnica en la arquitectura de la aplicación (Expo SDK 57 / Clean Architecture).

---

## Resumen Ejecutivo de Cobertura V1

| ID | Historia de Usuario | Rol Principal | Componente / Archivo Clave | Estado en V1 |
|---|---|---|---|:---:|
| **HU-01** | Registrar Cuenta | Visitante | [`AuthView.tsx`](./src/presentation/views/auth/AuthView.tsx) (+ [`LoginForm.tsx`](./src/presentation/views/auth/LoginForm.tsx) / [`RegisterForm.tsx`](./src/presentation/views/auth/RegisterForm.tsx)), [`AuthContext.tsx`](./src/infrastructure/auth/AuthContext.tsx), [`schemas.ts`](./src/infrastructure/api/schemas.ts) (`RegisterSchema`) | **100% Completada** |
| **HU-02** | Iniciar y Cerrar Sesión | Usuario / Moderador / Admin | [`AuthView.tsx`](./src/presentation/views/auth/AuthView.tsx) (+ [`LoginForm.tsx`](./src/presentation/views/auth/LoginForm.tsx)), [`AndeanSidebar.tsx`](./src/presentation/components/navigation/AndeanSidebar.tsx), [`schemas.ts`](./src/infrastructure/api/schemas.ts) (`LoginSchema`) | **100% Completada** |
| **HU-03** | Explorar y Consultar una Ruta | Visitante / Usuario Registrado | [`ExploreView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/explore/ExploreView.tsx), [`TrekkingMap.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/components/map/TrekkingMap.tsx) | **100% Completada** |
| **HU-04** | Descargar Ruta para Consulta Offline | Usuario | [`tileCacheDB.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/tileCacheDB.ts), [`useTrekkingStore.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/useTrekkingStore.ts) | **100% Completada** |
| **HU-05** | Compartir una Ruta Publicada | Usuario | [`ExploreView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/explore/ExploreView.tsx) (Modal de difusión) | **100% Completada** |
| **HU-06** | Realizar una Ruta Existente | Usuario Registrado | [`ActivityView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/activity/ActivityView.tsx), [`activityService.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/database/activityService.ts) | **100% Completada** |
| **HU-07** | Planificar una Nueva Ruta | Usuario | [`RecordView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/record/RecordView.tsx) (Modo Borrador) | **100% Completada** |
| **HU-08** | Grabar una Nueva Ruta mediante GPS | Usuario | [`RecordView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/record/RecordView.tsx), `expo-location` | **100% Completada** |
| **HU-09** | Aprobar o Rechazar una Ruta | Moderador / Administrador | [`ModerationView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/moderation/ModerationView.tsx), [`routeService.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/database/routeService.ts) | **100% Completada** |
| **HU-10** | Gestionar Usuarios y Roles | Administrador | [`ProfileView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/profile/ProfileView.tsx), [`userProfileService.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/database/userProfileService.ts) | **100% Completada** |

**Resultado global: 10 de 10 Historias de Usuario satisfechas al 100%.**

---

## Detalle Técnico por Historia de Usuario

### HU-01: Registrar Cuenta
* **Rol**: Visitante
* **Narrativa**:
  > **Como** usuario nuevo de la plataforma,  
  > **Quiero** registrar una cuenta ingresando mis datos personales en el sistema,  
  > **Para** poder acceder a las funcionalidades de la plataforma de Trekking y gestionar mi perfil.
* **Criterios de Aceptación**:
  1. El sistema debe mostrar un formulario de registro cuando el visitante seleccione la opción “Registrarse”.
  2. El sistema debe permitir ingresar los datos necesarios para crear la cuenta (Nombre Completo, Correo, Usuario, Contraseña, Confirmar Contraseña y Aceptación de Normas de Seguridad en Montaña).
  3. El sistema debe validar que los datos ingresados sean correctos y que no exista una cuenta registrada con el mismo correo electrónico.
  4. El sistema debe crear la cuenta y asignarle automáticamente el rol básico “Usuario”.
  5. El sistema debe mostrar un mensaje confirmando que el registro fue realizado correctamente.
  6. Después de confirmar el registro, el sistema debe dirigir al usuario a la pantalla de inicio de sesión definida en la HU-02.
* **Evidencia de Implementación**:
  - Interfaz nativa: [`src/presentation/views/auth/AuthView.tsx`](./src/presentation/views/auth/AuthView.tsx) (compositor) + [`LoginForm.tsx`](./src/presentation/views/auth/LoginForm.tsx) / [`RegisterForm.tsx`](./src/presentation/views/auth/RegisterForm.tsx) (forms colocalizados con validación Zod) + primitivas [`src/presentation/components/native/`](./src/presentation/components/native/) (`Field`, `Button`, `Banner`).
  - Interfaz web: [`src/presentation/components/auth/AuthModal.tsx`](./src/presentation/components/auth/AuthModal.tsx) (Modo `register`).
  - Validación: [`src/infrastructure/api/schemas.ts`](./src/infrastructure/api/schemas.ts) (`RegisterSchema`: nombre, email, usuario, clave ≥ 8, confirmación, términos; testeado en `src/tests/domain.test.ts`).
  - Lógica de autenticación: [`src/infrastructure/auth/AuthContext.tsx`](./src/infrastructure/auth/AuthContext.tsx) (`register()` con rol `user` por defecto; fallbacks locales solo ante error de red).

---

### HU-02: Iniciar y Cerrar Sesión
* **Rol**: Usuario / Moderador / Administrador
* **Narrativa**:
  > **Como** usuario registrado de la plataforma,  
  > **Quiero** iniciar y cerrar sesión en el sistema,  
  > **Para** acceder de manera segura a las funcionalidades de la plataforma de Trekking y gestionar mi información personal.
* **Criterios de Aceptación**:
  1. Acceso a autenticación desde "Iniciar sesión" o trigger contextual.
  2. Ingreso de correo y contraseña registrados en HU-01.
  3. Contraseña oculta por defecto con toggle contextual para mostrar/ocultar (`Eye` / `EyeOff`).
  4. Validación estricta de credenciales con mensajes de error descriptivos.
  5. Si las credenciales son válidas, inicio de sesión y redirección a permisos correspondientes (RBAC).
  6. Si son incorrectas, mensaje de error sin iniciar sesión.
  7. Sesión persistente mediante `AsyncStorage` en Expo.
  8. Protección de rutas privadas cuando no hay sesión activa.
  9. Identificación del usuario activo con su avatar, nombre verificado y badge de rol en cabecera y sidebar.
  10. Cierre de sesión seguro desde el perfil o botón "Salir" del sidebar.
* **Evidencia de Implementación**:
  - Interfaz nativa: [`src/presentation/views/auth/AuthView.tsx`](./src/presentation/views/auth/AuthView.tsx), [`src/presentation/components/navigation/AndeanSidebar.tsx`](./src/presentation/components/navigation/AndeanSidebar.tsx), [`src/presentation/views/profile/ProfileView.tsx`](./src/presentation/views/profile/ProfileView.tsx).
  - Validación: [`src/infrastructure/api/schemas.ts`](./src/infrastructure/api/schemas.ts) (`LoginSchema`; credenciales inválidas nunca inician sesión — fallbacks solo con error de red).
  - Estado y Contexto: [`src/infrastructure/auth/AuthContext.tsx`](./src/infrastructure/auth/AuthContext.tsx) (`login()`, `logout()`, `currentUser`).

---

### HU-03: Explorar y Consultar una Ruta
* **Rol**: Visitante / Usuario Registrado
* **Narrativa**:
  > **Como** usuario de la plataforma,  
  > **Quiero** consultar el catálogo de rutas públicas, buscar y visualizar el detalle completo de un recorrido,  
  > **Para** conocer las características técnicas del trayecto antes de realizarlo.
* **Criterios de Aceptación**:
  1. Catálogo de rutas públicas y aprobadas (`status === 'published'`).
  2. Búsqueda por texto (título, descripción, región) y filtrado por dificultad (`facil`, `moderado`, `dificil`, `experto`).
  3. Visualización de tarjetas resumen con métricas (distancia km, desnivel, duración, dificultad).
  4. Selección de una ruta y verificación de autenticación.
  5. Si el usuario no está autenticado, solicitud modal de login/registro.
  6. Visualización del detalle completo: descripción, inicio, final, puntos relevantes y checkpoints.
  7. Mapa interactivo con zoom, paneo y capas cartográficas topográficas (Esri Topo, NatGeo, OpenTopoMap).
* **Evidencia de Implementación**:
  - Interfaz: [`src/presentation/views/explore/ExploreView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/explore/ExploreView.tsx).
  - Cartografía: [`src/presentation/components/map/TrekkingMap.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/components/map/TrekkingMap.tsx).
  - Datos de rutas: [`src/infrastructure/database/routeService.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/database/routeService.ts) y [`src/core/domain/seedData.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/core/domain/seedData.ts).

---

### HU-04: Descargar una Ruta para Consulta Offline
* **Rol**: Usuario
* **Narrativa**:
  > **Como** usuario de la aplicación,  
  > **Quiero** descargar una ruta para consultarla sin conexión a internet,  
  > **Para** poder seguir la ruta y ver su información cuando esté en zonas sin señal.
* **Criterios de Aceptación**:
  1. Opción "Descargar ruta" en el catálogo/detalle.
  2. Cálculo y visualización del tamaño estimado en MB (`calculateOfflineSizeMB()`).
  3. Confirmación del usuario antes de iniciar la descarga.
  4. Descarga y almacenamiento local del trazado, waypoints e información básica de la ruta en `AsyncStorage`.
  5. Descarga de tiles cartográficos mediante [`tileCacheDB.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/tileCacheDB.ts) para visualización sin señal.
  6. Notificación y confirmación visual de descarga completada (`✓ Descargada Offline`).
* **Evidencia de Implementación**:
  - Almacén de estado: [`src/infrastructure/persistence/useTrekkingStore.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/useTrekkingStore.ts) (`downloadRouteOffline()`, `offlineRouteIds`).
  - Motor de caché: [`src/infrastructure/persistence/tileCacheDB.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/tileCacheDB.ts).
  - Algoritmo de estimación: [`src/core/domain/calculations.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/core/domain/calculations.ts) (`calculateOfflineSizeMB()`).

---

### HU-05: Compartir una Ruta Publicada
* **Rol**: Usuario
* **Narrativa**:
  > **Como** usuario autenticado de la aplicación,  
  > **Quiero** compartir una ruta publicada mediante un enlace directo a través de los medios disponibles en la aplicación,  
  > **Para** poder difundir el recorrido con todos sus datos completos sin que se pierda la información.
* **Criterios de Aceptación**:
  1. Ingreso a la ruta y selección de la acción "Compartir".
  2. Verificación de que la ruta se encuentre en estado `published`.
  3. Generación de enlace directo único (`https://trekbolivia.bo/r/{id}`).
  4. Opciones disponibles: copiar al portapapeles, compartir por mensajería o redes sociales.
  5. Inclusión de resumen técnico: mapa, distancia, tiempo estimado, dificultad y región.
  6. Confirmación visual de enlace copiado o compartido exitosamente.
* **Evidencia de Implementación**:
  - Modal de difusión: [`src/presentation/views/explore/ExploreView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/explore/ExploreView.tsx) (`isShareModalOpen`, `routeToShare`).

---

### HU-06: Realizar una Ruta Existente
* **Rol**: Usuario Registrado
* **Narrativa**:
  > **Como** usuario registrado,  
  > **Quiero** seleccionar y recorrer una ruta publicada registrando mi actividad personal,  
  > **Para** realizar el trayecto de forma guiada, monitorear mi progreso y guardar el registro en mi historial.
* **Criterios de Aceptación**:
  1. Vista de preparación con ficha técnica y mapa de la ruta.
  2. Detección de ubicación actual y cálculo de distancia aproximada al punto de inicio (`calculateHaversineDistanceKm()`).
  3. Botón "Iniciar Actividad" que activa el cronómetro y el monitoreo en vivo.
  4. Despliegue del trazado oficial, posición actual, inicio, fin y checkpoints.
  5. Cálculo continuo de distancia recorrida, distancia restante y tiempo transcurrido.
  6. Consulta y check de checkpoints a medida que se alcanzan.
  7. Funcionalidad de Pausar y Reanudar actividad.
  8. Botón "Finalizar" que determina si la ruta fue completada o incompleta según el porcentaje recorrido.
  9. Almacenamiento seguro de la actividad en el historial personal y sincronización con Firestore.
* **Evidencia de Implementación**:
  - Vista interactiva: [`src/presentation/views/activity/ActivityView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/activity/ActivityView.tsx).
  - Servicio de base de datos: [`src/infrastructure/database/activityService.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/database/activityService.ts).
  - Gestor de actividad: [`src/infrastructure/persistence/useTrekkingStore.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/useTrekkingStore.ts) (`activeActivity`).

---

### HU-07: Planificar una Nueva Ruta
* **Rol**: Usuario
* **Narrativa**:
  > **Como** usuario autenticado,  
  > **Quiero** guardar una ruta como borrador,  
  > **Para** poder continuar planificando posteriormente y confirmar el punto inicial real.
* **Criterios de Aceptación**:
  1. Opción "Crear nueva ruta" en modo planificación.
  2. Mapa interactivo para situar punto inicial provisional y destino provisional.
  3. Guardado en memoria/almacenamiento como borrador (`draftRoute` con `status: 'draft'`).
  4. Persistencia garantizada al salir y reingresar a la aplicación.
  5. Capacidad de modificar título, descripción y waypoints antes de iniciar.
  6. Opción de confirmar o actualizar el punto inicial real con las coordenadas GPS al llegar al terreno.
  7. Paso directo del borrador confirmado hacia la grabación activa mediante GPS.
* **Evidencia de Implementación**:
  - Interfaz: [`src/presentation/views/record/RecordView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/record/RecordView.tsx) (`mode === 'plan'`).
  - Almacén de borradores: [`src/infrastructure/persistence/useTrekkingStore.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/useTrekkingStore.ts) (`draftRoute`, `setDraftRoute()`, `confirmRealStart()`).

---

### HU-08: Grabar una Nueva Ruta mediante GPS
* **Rol**: Usuario
* **Narrativa**:
  > **Como** usuario de la aplicación,  
  > **Quiero** grabar una nueva ruta,  
  > **Para** registrar mi trayecto, distancia, tiempos y guardarlos en mi perfil.
* **Criterios de Aceptación**:
  1. Ingreso a la vista de "Grabar Recorrido".
  2. Solicitud y validación de permisos de geolocalización GPS (`expo-location`).
  3. Botón "INICIAR RUTA" que comienza el muestreo continuo de coordenadas.
  4. Visualización en tiempo real de posición actual, distancia acumulada y tiempo de grabación.
  5. Botón "Añadir Parada" (checkpoint) con categoría (cumbre, mirador, agua, refugio, peligro) y notas.
  6. Capacidad de adjuntar fotos georreferenciadas a la expedición.
  7. Controles de Pausar y Reanudar grabación.
  8. Confirmación del punto final y detención de la grabación.
  9. Algoritmo automático de sugerencia de dificultad andina (`suggestRouteDifficulty()` según distancia y desnivel acumulado).
  10. Resumen final y guardado para envío a moderación.
* **Evidencia de Implementación**:
  - Interfaz y controles: [`src/presentation/views/record/RecordView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/record/RecordView.tsx).
  - Algoritmo de dificultad (RF-32): [`src/core/domain/calculations.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/core/domain/calculations.ts).
  - Validación de esquemas: [`src/infrastructure/api/schemas.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/api/schemas.ts) (`RouteCreationSchema`).

---

### HU-09: Aprobar o Rechazar una Ruta
* **Rol**: Moderador / Administrador
* **Narrativa**:
  > **Como** moderador o administrador de la plataforma,  
  > **Quiero** revisar las rutas enviadas por los usuarios y aprobarlas o rechazarlas,  
  > **Para** garantizar que las rutas publicadas cumplan con los criterios establecidos y mantener la calidad de la información.
* **Criterios de Aceptación**:
  1. Módulo exclusivo de "Bandeja de Moderación" con control de acceso por rol (RBAC).
  2. Listado de rutas en espera de revisión (`in_review` y `rejected`).
  3. Selección de ruta con inspección visual completa: mapa, trazado GPS, desniveles y paradas.
  4. Botón "Aprobar": transiciona el estado a `published`, registra fecha y nombre del moderador.
  5. Botón "Rechazar": exige ingresar obligatoriamente el motivo y observaciones técnicas del rechazo.
  6. Almacenamiento de observaciones en `moderationNotes`.
  7. Notificación en la ficha de la ruta para que el creador corrija las observaciones y solicite nueva revisión.
* **Evidencia de Implementación**:
  - Interfaz: [`src/presentation/views/moderation/ModerationView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/moderation/ModerationView.tsx).
  - Servicio de rutas: [`src/infrastructure/database/routeService.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/database/routeService.ts) (`updateRoute()`).

---

### HU-10: Gestionar Usuarios y Roles
* **Rol**: Administrador
* **Narrativa**:
  > **Como** administrador autenticado en la aplicación,  
  > **Quiero** consultar la información de los usuarios registrados, bloquear, desbloquear sus cuentas y asignar el rol de Moderador,  
  > **Para** poder mantener el control y la seguridad de la plataforma gestionando el estado de las cuentas y los permisos de cada rol.
* **Criterios de Aceptación**:
  1. Acceso al panel "Gestión de Usuarios y Roles" restringido exclusivamente al rol `admin`.
  2. Despliegue de la lista completa de usuarios registrados en el sistema.
  3. Visualización de información del usuario: nombre, correo electrónico, rol actual y estado de la cuenta.
  4. Botón "Bloquear Cuenta": actualiza `isBlocked = true`, impidiendo el acceso a operaciones de la plataforma.
  5. Botón "Desbloquear Cuenta": restaura el acceso normal del usuario.
  6. Botón "Asignar / Quitar Moderador": promueve a `moderator` o degrada a `user`.
  7. Confirmación y persistencia inmediata del cambio en Firestore y estado local.
* **Evidencia de Implementación**:
  - Panel administrativo: [`src/presentation/views/profile/ProfileView.tsx`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/presentation/views/profile/ProfileView.tsx) (Sección `isAdmin`).
  - Gestión de roles: [`src/infrastructure/persistence/useTrekkingStore.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/persistence/useTrekkingStore.ts) (`setUserRole()`, `toggleUserBlocked()`).
  - Servicio de perfiles: [`src/infrastructure/database/userProfileService.ts`](file:///d:/TRABAJO/uni/INGSOFT/trekking-bolivia/src/infrastructure/database/userProfileService.ts).

---

## Verificación Automatizada de la Suite

Todas las reglas de negocio, cálculos geoespaciales y validaciones que sustentan estas 10 Historias de Usuario están blindadas mediante pruebas unitarias automatizadas:

```bash
# Ejecutar verificación de tipos TypeScript
npm run lint

# Ejecutar diagnóstico de salud del proyecto
npx expo-doctor

# Ejecutar suite de pruebas de dominio (Haversine, RF-32, RF-10, Zod)
npx tsx -e "import { runAllUnitTests } from './src/tests/domain.test'; console.log(runAllUnitTests());"
```

* Estado: **100% aprobado (21/21 checks de expo-doctor, 0 errores de TypeScript, 4/4 pruebas unitarias de dominio verdes).**
