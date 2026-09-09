import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { JwtUserPayload } from "../types";
import { RegisterCitizenInput, RegisterOfficerInput, LoginInput } from "../validators/authValidator";
import { Role } from "@prisma/client";

export class AuthService {
  private readonly saltRounds = 10;

  /**
   * Generates a signed JWT access token for an authenticated user
   */
  generateToken(user: {
    id: string;
    email: string;
    role: Role;
    fullName: string;
    departmentId?: string | null;
  }): string {
    const payload: JwtUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      departmentId: user.departmentId || null,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Verifies and decodes a JWT access token
   */
  verifyToken(token: string): JwtUserPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Session token has expired. Please sign in again.");
      }
      throw ApiError.unauthorized("Invalid session token.");
    }
  }

  /**
   * Hashes a plain-text password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compares plain-text password against bcrypt hash
   */
  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Strips sensitive credentials (passwordHash) from user object before returning to client
   */
  sanitizeUser(user: any) {
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Registers a new Citizen account with automatic CITIZEN role assignment
   */
  async registerCitizen(input: RegisterCitizenInput) {
    // 1. Check for duplicate email
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw ApiError.conflict("An account with this email address already exists.");
    }

    // 2. Check for duplicate mobile number
    const existingPhone = await userRepository.findByPhone(input.phone);
    if (existingPhone) {
      throw ApiError.conflict("An account with this mobile number already exists.");
    }

    // 3. Hash password securely
    const passwordHash = await this.hashPassword(input.password);

    // 4. Create user and citizen profile in transaction (role forced to CITIZEN)
    const newUser = await userRepository.createCitizen({
      ...input,
      passwordHash,
    });

    // 5. Generate authentication token
    const token = this.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      departmentId: null,
    });

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  /**
   * Registers a new Department Field Officer or Senior Government Officer
   * Creates User + OfficerProfile with specific department and jurisdiction
   */
  async registerOfficer(input: RegisterOfficerInput) {
    // 1. Check for duplicate email
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw ApiError.conflict("An account with this official email address already exists.");
    }

    // 2. Check for duplicate mobile number
    const existingPhone = await userRepository.findByPhone(input.phone);
    if (existingPhone) {
      throw ApiError.conflict("An account with this mobile number already exists.");
    }

    // 3. Verify selected department exists (or auto-link General Admin if ADMIN without department)
    let validatedDeptId = input.departmentId;
    if (input.role === Role.ADMIN && !validatedDeptId) {
      const genAdmin = await prisma.department.findUnique({
        where: { code: "GENERAL_ADMINISTRATION" },
      });
      validatedDeptId = genAdmin?.id;
    } else if (validatedDeptId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedDeptId },
      });
      if (!department) {
        throw ApiError.badRequest("Selected department is invalid or does not exist.");
      }
    } else {
      throw ApiError.badRequest("Department selection is required for officers.");
    }

    // 4. Hash password securely
    const passwordHash = await this.hashPassword(input.password);

    // 5. Create user and officer profile
    const newUser = await userRepository.createOfficer({
      ...input,
      departmentId: validatedDeptId,
      passwordHash,
    });

    // 6. Generate authentication token with departmentId
    const token = this.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      departmentId: newUser.officerProfile?.departmentId,
    });

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  /**
   * Authenticates user credentials and issues access token
   * Supports both Email and Mobile Number login
   */
  async login(input: LoginInput) {
    const rawIdentifier = input.identifier || input.email;
    if (!rawIdentifier) {
      throw ApiError.badRequest("Email or mobile number is required.");
    }

    // 1. Find user by email or mobile number
    const user = await userRepository.findByIdentifier(rawIdentifier);
    if (!user) {
      throw ApiError.unauthorized("Invalid email/mobile number or password.");
    }

    // 2. Verify account is active
    if (!user.isActive) {
      throw ApiError.forbidden("Your account is currently deactivated. Please contact administration.");
    }

    // 3. Verify password
    const isPasswordValid = await this.comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email/mobile number or password.");
    }

    // 4. Update last login timestamp asynchronously
    userRepository.updateLastLogin(user.id).catch(() => {});

    // 5. Generate token
    const departmentId = user.officerProfile?.departmentId || null;
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      departmentId,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Retrieve full current user profile by authenticated ID
   */
  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User account not found.");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Your account is currently deactivated.");
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
export default authService;
