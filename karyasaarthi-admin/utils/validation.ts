/**
 * Form validation schemas using Zod — type-safe validation.
 * 
 * OWASP A03: All user inputs validated before API submission.
 */

import { z } from 'zod';

// ── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

export const signupSchema = z
  .object({
    fullname: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .max(254, 'Email too long')
      .transform((v) => v.trim().toLowerCase()),
    phone: z
      .string()
      .min(10, 'Phone must be 10 digits')
      .max(15, 'Phone too long')
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .max(128, 'Password too long')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    role: z.enum(['customer', 'vendor']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email')
    .transform((v) => v.trim().toLowerCase()),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ── Profile Schemas ──────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  fullname: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  address: z.string().max(300, 'Address too long').optional(),
});

// ── Project Schemas ──────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(200, 'Name too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long'),
  service_id: z.number().int().positive().optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  deadline: z.string().optional(),
});

// ── Chat Schemas ─────────────────────────────────────────────────────────────

export const messageSchema = z.object({
  text: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long'),
});

// ── Type Exports ─────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
