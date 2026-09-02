import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { JwtUserPayload } from "../types";
import { RegisterCitizenInput, LoginInput } from "../validators/authValidator";
import { User, Role } from "@prisma/client";

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

    // 2. Check for duplicate mobile number if provided
    if (input.phone) {
      const existingPhone = await userRepository.findByPhone(input.phone);
      if (existingPhone) {
        throw ApiError.conflict("An account with this mobile number already exists.");
      }
    }

    // 3. Hash password securely
    const passwordHash = await this.hashPassword(input.password);

    // 4. Create user and citizen profile in transaction
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
   * Authenticates user credentials and issues access token
   */
  async login(input: LoginInput) {
    // 1. Find user by email
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    // 2. Verify account is active
    if (!user.isActive) {
      throw ApiError.forbidden("Your account is currently deactivated. Please contact administration.");
    }

    // 3. Verify password
    const isPasswordValid = await this.comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password.");
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
