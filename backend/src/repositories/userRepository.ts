import { BaseRepository } from "./baseRepository";
import { User, Role, Prisma } from "@prisma/client";
import { RegisterCitizenInput } from "../validators/authValidator";

export class UserRepository extends BaseRepository {
  /**
   * Find user by unique email with profiles included
   */
  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        citizenProfile: {
          include: {
            location: true,
          },
        },
        officerProfile: {
          include: {
            department: true,
            location: true,
          },
        },
      },
    });
  }

  /**
   * Find user by unique phone number
   */
  async findByPhone(phone: string) {
    return this.db.user.findUnique({
      where: { phone: phone.trim() },
    });
  }

  /**
   * Find user by ID with complete profile and department relationships
   */
  async findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: {
        citizenProfile: {
          include: {
            location: true,
          },
        },
        officerProfile: {
          include: {
            department: true,
            location: true,
          },
        },
      },
    });
  }

  /**
   * Register a new Citizen account along with their 1-to-1 CitizenProfile
   */
  async createCitizen(
    input: RegisterCitizenInput & { passwordHash: string }
  ) {
    return this.db.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash: input.passwordHash,
        fullName: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        role: Role.CITIZEN,
        citizenProfile: {
          create: {
            aadhaarHash: input.aadhaarHash || null,
            gender: input.gender || null,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
            addressLine1: input.addressLine1 || null,
            addressLine2: input.addressLine2 || null,
            pincode: input.pincode || null,
            locationId: input.locationId || null,
            occupation: input.occupation || null,
            emergencyContact: input.emergencyContact || null,
          },
        },
      },
      include: {
        citizenProfile: {
          include: {
            location: true,
          },
        },
      },
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Update password hash
   */
  async updatePassword(userId: string, passwordHash: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
