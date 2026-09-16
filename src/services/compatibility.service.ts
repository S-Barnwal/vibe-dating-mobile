import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

// ============================================================
// VIBE - COMPATIBILITY SERVICE
// ============================================================

export type CompatibleProfile = {
  id: string;
  userId: string;

  name: string;
  age: number;

  gender?: string;
  interestedIn?: string;

  bio: string;
  description?: string;

  interests: string[];
  photos: string[];
  primaryPhoto?: string | null;

  datingIntention: string;

  prompts: {
    question: string;
    answer: string;
  }[];

  isVerified: boolean;

  lastActiveAt?: string;

  distance?: string | null;

  compatibility: number;

  compatibilityReasons: string[];

  sharedInterests: string[];

  compatibilityBreakdown?: {
    interests: number;
    intention: number;
    preferences: number;
    distance: number;
    activity: number;
  };
};


// ============================================================
// RESPONSE TYPE
// ============================================================

export type MostCompatibleResponse = {
  success: boolean;

  data: {
    profiles: CompatibleProfile[];
    count: number;
  };
};


// ============================================================
// GET MOST COMPATIBLE PROFILES
// ============================================================
export const getMostCompatibleProfiles =
  async (): Promise<MostCompatibleResponse> => {
    const token = await getSavedToken();

    if (!token) {
      throw new Error(
        "Please login again to view compatible profiles."
      );
    }

    return apiRequest<MostCompatibleResponse>(
      "/compatibility/most-compatible",
      {
        method: "GET",
        token,
      }
    );
  };