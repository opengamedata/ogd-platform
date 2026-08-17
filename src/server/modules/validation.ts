import { z } from 'zod';

export const organizationRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);
export const lifecycleStatusSchema = z.enum(['draft', 'testing', 'active', 'archived']);
export const privacyClassificationSchema = z.enum([
  'test',
  'private',
  'embargoed',
  'approved_public',
  'restricted_human_subjects',
]);
export const releaseStatusSchema = z.enum([
  'not_submitted',
  'pending_review',
  'changes_requested',
  'approved',
  'rejected',
]);
export const enrollmentStatusSchema = z.enum([
  'requested',
  'setup_required',
  'active',
  'suspended',
  'archived',
]);
export const reviewStatusSchema = z.enum([
  'not_required',
  'draft',
  'pending',
  'changes_requested',
  'approved',
  'rejected',
]);

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
});

export const createGameSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  targetAudience: z.string().trim().max(160).optional().or(z.literal('')),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  thumbnailUrl: z.string().trim().url().max(1000).optional().or(z.literal('')),
  playUrl: z.string().trim().url().max(1000).optional().or(z.literal('')),
  sourceUrl: z.string().trim().url().max(1000).optional().or(z.literal('')),
  studies: z.string().trim().max(4000).optional().or(z.literal('')),
  lifecycleStatus: lifecycleStatusSchema.default('draft'),
  privacyClassification: privacyClassificationSchema.default('test'),
  releaseStatus: releaseStatusSchema.default('not_submitted'),
});

export const updateGameSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  targetAudience: z.string().trim().max(160).optional().or(z.literal('')),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  thumbnailUrl: z.string().trim().url().max(1000).optional().or(z.literal('')),
  playUrl: z.string().trim().url().max(1000).optional().or(z.literal('')),
  sourceUrl: z.string().trim().url().max(1000).optional().or(z.literal('')),
  studies: z.string().trim().max(4000).optional().or(z.literal('')),
  lifecycleStatus: lifecycleStatusSchema.optional(),
  privacyClassification: privacyClassificationSchema.optional(),
  releaseStatus: releaseStatusSchema.optional(),
});

export const createServiceEnrollmentSchema = z.object({
  serviceKey: z.string().trim().min(2).max(80),
});

export const updateServiceEnrollmentSchema = z.object({
  status: enrollmentStatusSchema.optional(),
  serviceResourceId: z.string().trim().max(500).optional().nullable(),
  serviceResourceUrl: z.string().trim().url().max(1000).optional().nullable(),
});

export const createReviewSchema = z.object({
  reviewType: z.string().trim().min(2).max(80),
  status: reviewStatusSchema.default('draft'),
  notes: z.string().trim().max(4000).optional().or(z.literal('')),
});
