import axiosClient from "./axiosClient";
import {
  ApiResponse,
  AuthResponseData,
  LoginPayload,
  RegisterCitizenPayload,
  RegisterOfficerPayload,
  User,
} from "../types";

export const authApi = {
  /**
   * Register a new citizen account
   */
  register: async (payload: RegisterCitizenPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  /**
   * Register a new field officer or government officer
   */
  registerOfficer: async (payload: RegisterOfficerPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponseData>>(
      "/auth/register-officer",
      payload
    );
    return response.data;
  },

  /**
   * Authenticate user credentials and return JWT token
   */
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      payload
    );
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await axiosClient.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  /**
   * Acknowledge session logout
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await axiosClient.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },
};

export default authApi;
