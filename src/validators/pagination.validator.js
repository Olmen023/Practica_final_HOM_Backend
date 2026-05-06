import { z } from 'zod';

export const paginationSchema = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const clientListSchema = paginationSchema.extend({
  sort: z.string().default('-createdAt'),
  name: z.string().optional(),
});

export const projectListSchema = paginationSchema.extend({
  sort:   z.string().default('-createdAt'),
  client: z.string().optional(),
  name:   z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
});

export const deliverynoteListSchema = paginationSchema.extend({
  sort:    z.string().default('-workDate'),
  project: z.string().optional(),
  client:  z.string().optional(),
  format:  z.enum(['material', 'hours']).optional(),
  signed:  z.enum(['true', 'false']).optional(),
  from:    z.string().optional(),
  to:      z.string().optional(),
});
