import { BaseRepository } from "./baseRepository";
import { Role } from "@prisma/client";
import { RegisterCitizenInput } from "../validators/authValidator";

export class UserRepository extends BaseRepository {
  /**
   * Find user by unique email with profiles and relations included
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
   * Find user by unique phone number with profiles and relations included
   */
  async findByPhone(phone: string) {
    const cleanPhone = phone.trim();
    // Also try matching with/without +91
    const alternatePhone = cleanPhone.startsWith("+91")
      ? cleanPhone.substring(3)
      : cleanPhone.startsWith("91") && cleanPhone.length === 12
      ? cleanPhone.substring(2)
      : `+91${cleanPhone}`;

    return this.db.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: alternatePhone },
        ],
      },
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
   * Find user by identifier (Email or Mobile Number)
   */
  async findByIdentifier(identifier: string) {
    const trimmed = identifier.trim();
    if (trimmed.includes("@")) {
      return this.findByEmail(trimmed);
    }
    return this.findByPhone(trimmed);
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
   * Always enforces Role.CITIZEN on backend
   */
  async createCitizen(
    input: RegisterCitizenInput & { passwordHash: string }
  ) {
    // Standardize phone format if needed
    let cleanPhone = input.phone.trim();
    if (!cleanPhone.startsWith("+91") && cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    }

    // Find or create matching Location for state, city, and pincode
    let locationId = input.locationId || null;
    if (!locationId && input.city && input.state && input.pincode) {
      try {
        const existingLoc = await this.db.location.findFirst({
          where: {
            state: input.state.trim(),
            district: input.city.trim(),
            pincode: input.pincode.trim(),
          },
        });

        if (existingLoc) {
          locationId = existingLoc.id;
        } else {
          const newLoc = await this.db.location.create({
            data: {
              state: input.state.trim(),
              district: input.city.trim(),
              locality: input.addressLine1.trim(),
              pincode: input.pincode.trim(),
            },
          });
          locationId = newLoc.id;
        }
      } catch {
        // Fallback gracefully without blocking registration
        locationId = null;
      }
    }

    return this.db.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash: input.passwordHash,
        fullName: input.fullName.trim(),
        phone: cleanPhone,
        role: Role.CITIZEN,
        citizenProfile: {
          create: {
            aadhaarHash: input.aadhaarHash || null,
            gender: input.gender || null,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
            addressLine1: input.addressLine1.trim(),
            addressLine2: input.addressLine2?.trim() || `${input.city.trim()}, ${input.state.trim()}`,
            pincode: input.pincode.trim(),
            locationId: locationId,
            occupation: input.occupation?.trim() || null,
            emergencyContact: input.emergencyContact?.trim() || null,
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
