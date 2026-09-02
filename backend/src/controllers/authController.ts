import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../config/db";
import { env } from "../config/env";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { JwtUserPayload } from "../types";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().optional(),
    role: z.enum(["CITIZEN", "OFFICER", "SENIOR_OFFICER", "ADMIN"]).optional(),
    departmentId: z.string().optional(),
    designation: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, phone, role, departmentId, designation } = req.body;
    const userRole = (role as Role) || Role.CITIZEN;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiError.conflict("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        phone,
        role: userRole,
        citizenProfile:
          userRole === Role.CITIZEN
            ? {
                create: {},
              }
            : undefined,
        officerProfile:
          userRole === Role.OFFICER || userRole === Role.SENIOR_OFFICER
            ? {
                create: {
                  departmentId: departmentId || "dept-water-supply",
                  designation: designation || "Assigned Officer",
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        officerProfile: {
          select: {
            departmentId: true,
            designation: true,
          },
        },
      },
    });

    const tokenPayload: JwtUserPayload = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      departmentId: newUser.officerProfile?.departmentId,
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return ApiResponse.created(
      res,
      { user: newUser, token },
      "User registered successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        officerProfile: {
          include: {
            department: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const tokenPayload: JwtUserPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.officerProfile?.departmentId,
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return ApiResponse.success(
      res,
      { user: userWithoutPassword, token },
      "Logged in successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("Not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        citizenProfile: true,
        officerProfile: {
          include: {
            department: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return ApiResponse.success(res, user, "User profile retrieved");
  } catch (error) {
    next(error);
  }
};
