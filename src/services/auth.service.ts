import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiRequest } from "./api";

// =====================================================
// TYPES
// =====================================================

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  profileCompleted: boolean;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
};

export type VerifyEmailResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
};

export type BasicResponse = {
  success: boolean;
  message: string;
};

// =====================================================
// STORAGE KEYS
// =====================================================

const TOKEN_KEY = "@vibe_auth_token";
const USER_KEY = "@vibe_auth_user";

// =====================================================
// SIGNUP
// =====================================================

export const signup = async ({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await apiRequest<AuthResponse>(
    "/auth/signup",
    {
      method: "POST",
      body: {
        name,
        email,
        password,
        confirmPassword,
      },
    }
  );

  return response;
};

// =====================================================
// VERIFY EMAIL OTP
// =====================================================

export const verifyEmailOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const response =
    await apiRequest<VerifyEmailResponse>(
      "/auth/verify-email-otp",
      {
        method: "POST",
        body: {
          email,
          otp,
        },
      }
    );

  return response;
};

// =====================================================
// RESEND EMAIL OTP
// =====================================================

export const resendEmailOtp = async (
  email: string
) => {
  const response =
    await apiRequest<BasicResponse>(
      "/auth/resend-email-otp",
      {
        method: "POST",
        body: {
          email,
        },
      }
    );

  return response;
};

// =====================================================
// LOGIN
// =====================================================

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: {
        email,
        password,
      },
    }
  );

  return response;
};

// =====================================================
// GET CURRENT USER
// =====================================================

export const getMe = async (token: string) => {
  const response = await apiRequest<{
    success: boolean;
    data: {
      user: AuthUser;
    };
  }>("/auth/me", {
    method: "GET",
    token,
  });

  return response;
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = async ({
  token,
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  token: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await apiRequest<BasicResponse>(
    "/auth/change-password",
    {
      method: "POST",
      token,
      body: {
        currentPassword,
        newPassword,
        confirmPassword,
      },
    }
  );

  return response;
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (
  email: string
) => {
  const response =
    await apiRequest<BasicResponse>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: {
          email,
        },
      }
    );

  return response;
};

// =====================================================
// VERIFY RESET OTP
// =====================================================

export const verifyResetOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const response =
    await apiRequest<BasicResponse>(
      "/auth/verify-reset-otp",
      {
        method: "POST",
        body: {
          email,
          otp,
        },
      }
    );

  return response;
};

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async ({
  email,
  newPassword,
  confirmPassword,
}: {
  email: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response =
    await apiRequest<BasicResponse>(
      "/auth/reset-password",
      {
        method: "POST",
        body: {
          email,
          newPassword,
          confirmPassword,
        },
      }
    );

  return response;
};

// =====================================================
// SAVE AUTH SESSION
// =====================================================

export const saveAuthSession = async ({
  token,
  user,
}: {
  token: string;
  user: AuthUser;
}) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
};

// =====================================================
// GET SAVED TOKEN
// =====================================================

export const getSavedToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

// =====================================================
// GET SAVED USER
// =====================================================

export const getSavedUser =
  async (): Promise<AuthUser | null> => {
    const user = await AsyncStorage.getItem(
      USER_KEY
    );

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  };

// =====================================================
// CLEAR AUTH SESSION / LOGOUT
// =====================================================

export const clearAuthSession = async () => {
  try {
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      USER_KEY,
    ]);
  } catch (error) {
    console.error(
      "Failed to clear auth session:",
      error
    );

    throw error;
  }
};