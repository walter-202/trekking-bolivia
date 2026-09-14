# Trekking Bolivia Pro 🏔️ (Expo SDK 57)

Aplicación móvil y multiplataforma de senderismo, cartografía andina y navegación offline para Bolivia, construida con **Expo SDK 57** (`expo@57.0.22`, `react-native@0.86.3`), **TypeScript**, **Zustand** y principios de **Clean Architecture**.

---

## 🏛️ Arquitectura del Sistema (Clean Architecture)

El proyecto sigue una estricta separación de capas para garantizar que la lógica de negocio permanezca pura e independiente de frameworks o SDKs externos:

```
src/
├── core/
│   └── domain/                 # 100% TypeScript puro, sin dependencias
│       ├── types.ts            # Entidades: RouteModel, UserProfile, Checkpoint, etc.
│       ├── calculations.ts     # Haversine, cálculo de desniveles, dificultad andina (RF-32)
│       └── seedData.ts         # Rutas icónicas: Takesi, Choro, Illampu, Huayna Potosí
├── infrastructure/
│   ├── auth/                   # Contexto de autenticación y RBAC (User, Moderator, Admin)
│   ├── persistence/            # Zustand persistido con AsyncStorage y TileCacheDB guardado
│   ├── database/               # Servicios de Firestore (rutas, actividades, perfiles)
│   └── api/                    # Esquemas de validación con Zod
├── presentation/
│   ├── views/                  # Pantallas dedicadas (Sin modales invasivos)
│   │   ├── explore/            # Explorador de rutas y detalle topográfico con Share nativo
│   │   ├── activity/           # Grabación y navegación en vivo con brújula
│   │   ├── record/             # Trazado de ruta, checkpoints y guardado paso a paso
│   │   ├── moderation/         # Panel de evaluación técnica para moderadores (RBAC)
│   │   ├── profile/            # Bitácora, estadísticas, cumbres y paquetes offline
│   │   ├── auth/               # Registro e inicio de sesión en pantalla completa
│   │   └── testRunner/         # Ejecutor de pruebas unitarias TDD en pantalla completa
│   └── components/
│       ├── map/                # Mapa topográfico interactivo con soporte de capas Esri/OpenTopo
│       └── navigation/         # AndeanSidebar táctico (78% viewport width)
└── tests/
    └── domain.test.ts          # Suite de pruebas unitarias de cálculos de dominio y esquemas
```

---

## 📋 Historias de Usuario Implementadas (HU-01 a HU-10)

Documentación detallada de criterios de aceptación y mapeo de código en [`USER_STORIES.md`](./USER_STORIES.md):

1. **HU-01 — Registrar Cuenta**: Registro con validación en [`src/presentation/views/auth/AuthView.tsx`](./src/presentation/views/auth/AuthView.tsx).
2. **HU-02 — Iniciar y Cerrar Sesión**: Sesión segura con persistencia en `AsyncStorage`.
3. **HU-03 — Explorar Rutas y Senderos**: Filtros por dificultad y búsqueda en tiempo real.
4. **HU-04 — Descargar Mapas Offline**: Caché de cuadrículas topográficas y waypoints.
5. **HU-05 — Compartir Información de Rutas**: Hoja de compartir nativa del sistema operativo (`Share.share`).
6. **HU-06 — Registrar Nueva Ruta**: Trazado GPS continuo y adición de checkpoints categorizados.
7. **HU-07 — Moderar Rutas**: Panel de dictamen técnico con roles RBAC (`moderator`/`admin`).
8. **HU-08 — Monitorear Actividad en Vivo**: Métricas en ruta: distancia recorrida, desnivel y tiempo.
9. **HU-09 — Consultar Puntos de Interés**: Alertas de seguridad, agua y zonas de campamento.
10. **HU-10 — Almacenamiento Seguro**: Persistencia local desacoplada para zonas sin cobertura móvil.

---

## 🚀 Comandos Principales

### 1. Iniciar la aplicación
```bash
npm start          # Inicia el Metro Bundler interactivo de Expo
npm run web        # Ejecuta la versión web
npm run android    # Ejecuta en emulador o dispositivo Android
npm run ios        # Ejecuta en simulador iOS (macOS)
```

### 2. Ejecutar Pruebas Unitarias de Dominio (TDD)
```bash
npm test
```

### 3. Verificación de Tipos TypeScript (0 errores)
```bash
npm run lint
```

### 4. Auditoría de Salud de Expo (100/100)
```bash
npx expo-doctor
```
Verifica 21 comprobaciones automáticas del proyecto: compatibilidad de dependencias en Expo SDK 57, esquema de `app.json`, configuración de Git ignores y dependencias duplicadas.
