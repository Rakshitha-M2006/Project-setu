import { z } from "zod";
import { Gender } from "@prisma/client";

export const registerCitizenSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password must not exceed 100 characters"),
    fullName: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters long")
      .max(100, "Full name must not exceed 100 characters"),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9]{10,15}$/, "Phone number must be a valid 10 to 15 digit format")
      .optional()
      .nullable(),
    aadhaarHash: z.string().optional().nullable(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    dateOfBirth: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional()
      .nullable(),
    addressLine1: z.string().trim().max(255).optional().nullable(),
    addressLine2: z.string().trim().max(255).optional().nullable(),
    pincode: z
      .string()
      .trim()
      .regex(/^[1-9][0-9]{5}$/, "Pincode must be a valid 6-digit Indian PIN code")
      .optional()
      .nullable(),
    locationId: z.string().optional().nullable(),
    occupation: z.string().trim().max(100).optional().nullable(),
    emergencyContact: z.string().trim().optional().nullable(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password cannot be empty"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9]{10,15}$/, "Phone number must be a valid 10 to 15 digit format")
      .optional()
      .nullable(),
    addressLine1: z.string().trim().max(255).optional().nullable(),
    addressLine2: z.string().trim().max(255).optional().nullable(),
    pincode: z
      .string()
      .trim()
      .regex(/^[1-9][0-9]{5}$/, "Pincode must be a valid 6-digit Indian PIN code")
      .optional()
      .nullable(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    occupation: z.string().trim().max(100).optional().nullable(),
    emergencyContact: z.string().trim().optional().nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  }),
});

export type RegisterCitizenInput = z.infer<typeof registerCitizenSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
