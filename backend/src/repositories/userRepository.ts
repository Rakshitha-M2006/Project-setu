import { BaseRepository } from "./baseRepository";
import { Role } from "@prisma/client";
import { RegisterCitizenInput, RegisterOfficerInput } from "../validators/authValidator";

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

    const addr1 = (input.addressLine1 || "Residential Address").trim();
    const userCity = (input.city || "District Center").trim();
    const userState = (input.state || "State").trim();

    // Find or create matching Location for state, city, and pincode
    let locationId = input.locationId || null;
    if (!locationId && userCity && userState && input.pincode) {
      try {
        const existingLoc = await this.db.location.findFirst({
          where: {
            state: userState,
            district: userCity,
            pincode: input.pincode.trim(),
          },
        });

        if (existingLoc) {
          locationId = existingLoc.id;
        } else {
          const newLoc = await this.db.location.create({
            data: {
              state: userState,
              district: userCity,
              locality: addr1,
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
            addressLine1: addr1,
            addressLine2: input.addressLine2?.trim() || `${userCity}, ${userState}`,
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
   * Register a new Department Field Officer or Senior Government Officer
   * Supports both Role.OFFICER and Role.SENIOR_OFFICER with OfficerProfile
   */
  async createOfficer(
    input: RegisterOfficerInput & { passwordHash: string }
  ) {
    let cleanPhone = input.phone.trim();
    if (!cleanPhone.startsWith("+91") && cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    }

    const userCity = (input.city || "District Headquarters").trim();
    const userState = (input.state || "Delhi NCT").trim();
    const pincode = (input.pincode || "110001").trim();

    // Find or create matching Location
    let locationId: string | null = null;
    try {
      const existingLoc = await this.db.location.findFirst({
        where: {
          state: userState,
          district: userCity,
          pincode,
        },
      });

      if (existingLoc) {
        locationId = existingLoc.id;
      } else {
        const newLoc = await this.db.location.create({
          data: {
            state: userState,
            district: userCity,
            locality: input.jurisdictionWard || `${userCity} Official Command`,
            pincode,
          },
        });
        locationId = newLoc.id;
      }
    } catch {
      locationId = null;
    }

    if (input.role === Role.ADMIN) {
      let deptId = input.departmentId;
      if (!deptId) {
        const genAdmin = await this.db.department.findUnique({
          where: { code: "GENERAL_ADMINISTRATION" },
        });
        deptId = genAdmin?.id;
      }

      return this.db.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          passwordHash: input.passwordHash,
          fullName: input.fullName.trim(),
          phone: cleanPhone,
          role: Role.ADMIN,
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          officerProfile: deptId ? {
            create: {
              departmentId: deptId,
              badgeNumber: input.badgeNumber?.trim() || `ADM-ROOT-${Math.floor(100 + Math.random() * 900)}`,
              designation: input.designation?.trim() || "Super Administrator & Governance Controller",
              jurisdictionWard: input.jurisdictionWard?.trim() || "National Platform Master Command",
              locationId,
              isAvailable: true,
            },
          } : undefined,
        },
        include: {
          officerProfile: {
            include: {
              department: true,
              location: true,
            },
          },
        },
      });
    }

    // Auto-generate badge number if not explicitly specified
    let badge = input.badgeNumber?.trim();
    if (!badge) {
      const dept = await this.db.department.findUnique({
        where: { id: input.departmentId! },
      });
      const prefix = dept?.code?.slice(0, 3) || "GOV";
      const randomNum = Math.floor(100 + Math.random() * 900);
      badge = input.role === Role.SENIOR_OFFICER
        ? `HOD-${prefix}-${randomNum}`
        : `${prefix}-OF-${randomNum}`;
    }

    return this.db.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash: input.passwordHash,
        fullName: input.fullName.trim(),
        phone: cleanPhone,
        role: input.role,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        officerProfile: {
          create: {
            departmentId: input.departmentId!,
            badgeNumber: badge,
            designation: (input.designation || "Field Redressal Officer").trim(),
            jurisdictionWard: input.jurisdictionWard?.trim() || (input.role === Role.SENIOR_OFFICER ? "State / Departmental Command Headquarters" : "Ward Jurisdictional Area"),
            locationId,
            isAvailable: true,
          },
        },
      },
      include: {
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
