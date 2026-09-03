export type Role = "CITIZEN" | "OFFICER" | "SENIOR_OFFICER" | "ADMIN";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  defaultSlaHours?: number;
  nodalOfficerName?: string | null;
  nodalOfficerEmail?: string | null;
}

export interface Location {
  id: string;
  state: string;
  district: string;
  subDistrict?: string | null;
  blockOrWard?: string | null;
  locality?: string | null;
  pincode: string;
}

export interface CitizenProfile {
  id: string;
  userId: string;
  aadhaarHash?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  pincode?: string | null;
  locationId?: string | null;
  location?: Location | null;
  emergencyContact?: string | null;
  occupation?: string | null;
}

export interface OfficerProfile {
  id: string;
  userId: string;
  departmentId: string;
  department?: Department | null;
  badgeNumber?: string | null;
  designation: string;
  jurisdictionWard?: string | null;
  locationId?: string | null;
  location?: Location | null;
  isAvailable: boolean;
  activeGrievanceCount: number;
  resolvedGrievanceCount: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  fullName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  citizenProfile?: CitizenProfile | null;
  officerProfile?: OfficerProfile | null;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface RegisterCitizenPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  gender?: Gender | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  pincode?: string | null;
  occupation?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}
