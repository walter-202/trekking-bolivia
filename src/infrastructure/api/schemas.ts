import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  timestamp: z.number().optional(),
});

export const CheckpointCategorySchema = z.enum([
  'agua',
  'camping',
  'peligro',
  'vista',
  'descanso',
  'flora_fauna',
  'refugio',
]);

export const CheckpointSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'El nombre del punto debe tener al menos 2 caracteres'),
  category: CheckpointCategorySchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  notes: z.string().optional(),
  photoUrl: z.string().url().or(z.string().startsWith('data:')).optional(),
  createdAt: z.number(),
});

export const RouteCreationSchema = z.object({
  title: z.string().min(4, 'El título de la ruta debe tener al menos 4 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  region: z.string().default('La Paz, Bolivia'),
  startPoint: z.object({
    name: z.string().min(2),
    lat: z.number(),
    lng: z.number(),
  }),
  endPoint: z.object({
    name: z.string().min(2),
    lat: z.number(),
    lng: z.number(),
  }),
  distanceKm: z.number().nonnegative(),
  durationMinutes: z.number().positive(),
  difficulty: z.enum(['facil', 'moderado', 'dificil', 'experto']),
  modality: z.enum(['solo', 'acompañado']),
  isPrivate: z.boolean().default(false),
  status: z.enum(['draft', 'in_review', 'published', 'rejected']).default('draft'),
  waypoints: z.array(CoordinatesSchema).default([]),
  checkpoints: z.array(CheckpointSchema).default([]),
  photos: z.array(z.string()).default([]),
});

export const ActivityLogSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  routeId: z.string().min(1),
  routeTitle: z.string().min(1),
  status: z.enum(['in_progress', 'paused', 'completed', 'incomplete']),
  startedAt: z.number(),
  finishedAt: z.number().optional(),
  distanceCoveredKm: z.number().nonnegative(),
  remainingDistanceKm: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  recordedPoints: z.array(CoordinatesSchema),
  completedCheckpoints: z.array(z.string()).default([]),
});

export const ReviewActionSchema = z.object({
  status: z.enum(['published', 'rejected']),
  moderationNotes: z.string().min(3, 'Debe incluir un motivo u observaciones claras para el autor'),
});

export const LoginSchema = z.object({
  email: z.string().trim().min(1, 'Introduce tu correo electrónico.').email('Introduce un correo electrónico válido.'),
  password: z.string().min(1, 'Introduce tu contraseña.'),
});

export const RegisterSchema = z
  .object({
    name: z.string().trim().min(3, 'Por favor ingresa tu nombre completo.'),
    email: z.string().trim().min(1, 'Introduce un correo electrónico.').email('Introduce un correo electrónico válido.'),
    username: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9_.]{3,30}$/, 'El usuario debe tener 3-30 caracteres (letras, números, _ .).')
      .optional(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Repite tu contraseña.'),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, 'Debes aceptar los términos y las normas de seguridad en montaña.'),
  })
  .refine((data) => data.password === data.confirmPassword, 'Las contraseñas no coinciden.');

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const BulkSyncSchema = z.object({
  activities: z.array(ActivityLogSchema),
  drafts: z.array(RouteCreationSchema).optional(),
});
