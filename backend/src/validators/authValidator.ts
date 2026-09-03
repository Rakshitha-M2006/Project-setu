import { z } from "zod";
import { Gender } from "@prisma/client";

// Regex for valid 10-digit Indian Mobile Numbers (with optional +91 or 91 country code)
const INDIAN_PHONE_REGEX = /^(?:\+91|91)?[6-9]\d{9}$/;

// Regex for valid 6-digit Indian PIN code (cannot start with 0)
const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Regex for password: min 8 characters, at least 1 letter and 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&_\-\.]{8,}$/;

export const registerCitizenSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters long")
      .max(100, "Full name must not exceed 100 characters"),

    email: z
      .string({ required_error: "Email address is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address format"),

    phone: z
      .string({ required_error: "Mobile number is required" })
      .trim()
      .regex(INDIAN_PHONE_REGEX, "Please provide a valid 10-digit Indian mobile number"),

    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password must not exceed 100 characters")
      .regex(PASSWORD_REGEX, "Password must contain at least 8 characters including letters and numbers"),

    dateOfBirth: z
      .string({ required_error: "Date of birth is required" })
      .trim()
      .refine((dobStr) => {
        const parsed = new Date(dobStr);
        if (isNaN(parsed.getTime())) return false;
        // Must not be a future date
        return parsed <= new Date();
      }, "Date of birth must be a valid date and cannot be in the future"),

    gender: z.nativeEnum(Gender, {
      required_error: "Gender is required",
      invalid_type_error: "Please select a valid gender option",
    }),

    addressLine1: z
      .string({ required_error: "Residential address is required" })
      .trim()
      .min(3, "Address must be at least 3 characters long")
      .max(255, "Address must not exceed 255 characters"),

    addressLine2: z.string().trim().max(255).optional().nullable(),

    city: z
      .string({ required_error: "City is required" })
      .trim()
      .min(2, "City must be at least 2 characters long")
      .max(100, "City must not exceed 100 characters"),

    state: z
      .string({ required_error: "State is required" })
      .trim()
      .min(2, "State must be at least 2 characters long")
      .max(100, "State must not exceed 100 characters"),

    pincode: z
      .string({ required_error: "Pincode is required" })
      .trim()
      .regex(INDIAN_PINCODE_REGEX, "Pincode must be a valid 6-digit Indian PIN code"),

    occupation: z.string().trim().max(100).optional().nullable(),
    emergencyContact: z.string().trim().optional().nullable(),
    aadhaarHash: z.string().optional().nullable(),
    locationId: z.string().optional().nullable(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z
      .string({ required_error: "Email or mobile number is required" })
      .trim()
      .min(1, "Email or mobile number is required")
      .optional(),
    email: z
      .string()
      .trim()
      .min(1, "Email or mobile number is required")
      .optional(),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }).refine((data) => !!(data.identifier || data.email), {
    message: "Email or mobile number is required",
    path: ["identifier"],
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: z
      .string()
      .trim()
      .regex(INDIAN_PHONE_REGEX, "Phone number must be a valid Indian mobile number")
      .optional()
      .nullable(),
    addressLine1: z.string().trim().max(255).optional().nullable(),
    addressLine2: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    state: z.string().trim().max(100).optional().nullable(),
    pincode: z
      .string()
      .trim()
      .regex(INDIAN_PINCODE_REGEX, "Pincode must be a valid 6-digit Indian PIN code")
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
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .regex(PASSWORD_REGEX, "New password must contain at least 8 characters including letters and numbers"),
  }),
});

export type RegisterCitizenInput = z.infer<typeof registerCitizenSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
