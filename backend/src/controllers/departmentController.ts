import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../config/db";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const createDepartmentSchema = z.object({
  body: z.object({
    code: z.string().min(2, "Department code is required"),
    name: z.string().min(2, "Department name is required"),
    description: z.string().optional(),
    slaHoursDefault: z.number().int().positive().optional(),
    contactEmail: z.string().email().optional(),
  }),
});

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        categories: true,
        _count: {
          select: { grievances: true, members: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return ApiResponse.success(res, departments, "Departments retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, name, description, slaHoursDefault, contactEmail } = req.body;

    const existing = await prisma.department.findUnique({
      where: { code },
    });

    if (existing) {
      throw ApiError.conflict("Department with this code already exists");
    }

    const dept = await prisma.department.create({
      data: {
        code,
        name,
        description,
        slaHoursDefault: slaHoursDefault || 48,
        contactEmail,
      },
    });

    return ApiResponse.created(res, dept, "Department created successfully");
  } catch (error) {
    next(error);
  }
};
