import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

export type MatchProfile = {
  id: string;
  userId: string;
  name: string;
  age: number | null;
  gender?: string;
  bio?: string;
  description?: string;
  interests: string[];
  photos: string[];
  primaryPhoto?: string | null;
  datingIntention?: string;
  prompts: {
    question: string;
    answer: string;
  }[];
  isVerified: boolean;
  lastActiveAt?: string | null;
  matchedAt: string;
};

export type MatchesResponse = {
  success: boolean;
  data: {
    matches: MatchProfile[];
    count: number;
  };
};

export const getMatches = async (): Promise<MatchesResponse> => {
  const token = await getSavedToken();

  if (!token) {
    throw new Error("Please login again to view your matches.");
  }

  return apiRequest<MatchesResponse>("/matches", {
    method: "GET",
    token,
  });
};