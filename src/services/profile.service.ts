import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

export type ProfilePrompt = {
  question: string;
  answer: string;
};

export type ProfileLocation = {
  latitude: number;
  longitude: number;
};

export type CompleteProfileRequest = {
  birthday: string;
  gender: string;
  interestedIn: string;
  interests: string[];
  photos: string[];
  bio: string;
  description?: string;
  datingIntention: string;
  prompts?: ProfilePrompt[];
  location?: ProfileLocation | null;
};

export type BecauseYouLikeProfile = {
  id: string;
  userId?: string;
  name: string | null;
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
  isDiscoverable?: boolean;
  distance?: string | null;
};

export type NewHereProfile = {
  id: string;
  userId?: string;
  name: string | null;
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
  isDiscoverable?: boolean;
  distance?: string | null;
};

export type NewHereResponse = {
  success: boolean;
  data: {
    profiles: NewHereProfile[];
    count: number;
  };
};

export type BecauseYouLikeResponse = {
  success: boolean;
  data: {
    interest: string | null;
    profiles: BecauseYouLikeProfile[];
    count: number;
  };
};

export type UpdateProfileRequest = {
  name?: string;
  bio?: string;
  description?: string;
  interests?: string[];
  photos?: string[];
  datingIntention?: string;
  prompts?: ProfilePrompt[];
  location?: ProfileLocation | null;
  isDiscoverable?: boolean;
};

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  profileCompleted: boolean;
};

export type ProfileData = {
  id: string;
  user: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  interestedIn: string;
  bio: string;
  description: string;
  interests: string[];
  photos: string[];
  primaryPhoto: string | null;
  datingIntention: string;
  prompts: ProfilePrompt[];
  location?: ProfileLocation | null;
  isVerified: boolean;
  lastActiveAt: string;
  isDiscoverable: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicProfile = {
  id: string;
  user: string;
  name: string;
  age: number;
  gender: string;
  interestedIn: string;
  bio: string;
  description: string;
  interests: string[];
  photos: string[];
  primaryPhoto: string | null;
  datingIntention: string;
  prompts: ProfilePrompt[];
  distance: string | null;
  isVerified: boolean;
  lastActiveAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DiscoverMyProfile = {
  id: string;
  interests: string[];
  datingIntention: string;
  gender: string;
  interestedIn: string;
};

export type CompleteProfileResponse = {
  success: boolean;
  message: string;
  data: {
    profile: ProfileData;
    user: ProfileUser;
  };
};

export type MyProfileResponse = {
  success: boolean;
  data: {
    profile: ProfileData;
    user: ProfileUser;
  };
};

export type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data: {
    profile: ProfileData;
    user: ProfileUser;
  };
};

export type DiscoverProfilesResponse = {
  success: boolean;
  data: {
    profiles: PublicProfile[];
    count: number;
    myProfile: DiscoverMyProfile;
  };
};

export type UpdateLastActiveResponse = {
  success: boolean;
  message: string;
  data: {
    lastActiveAt: string;
  };
};

const getAuthToken = async () => {
  const token = await getSavedToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please login again."
    );
  }

  return token;
};

export const completeProfile = async (
  profileData: CompleteProfileRequest
) => {
  const token = await getAuthToken();

  return apiRequest<CompleteProfileResponse>(
    "/profile/complete",
    {
      method: "POST",
      token,
      body: profileData,
    }
  );
};

export const getMyProfile = async () => {
  const token = await getAuthToken();

  return apiRequest<MyProfileResponse>(
    "/profile/me",
    {
      method: "GET",
      token,
    }
  );
};

export const updateProfile = async (
  profileData: UpdateProfileRequest
) => {
  const token = await getAuthToken();

  return apiRequest<UpdateProfileResponse>(
    "/profile/update",
    {
      method: "PUT",
      token,
      body: profileData,
    }
  );
};

export const updateLastActive = async () => {
  const token = await getAuthToken();

  return apiRequest<UpdateLastActiveResponse>(
    "/profile/activity",
    {
      method: "PATCH",
      token,
    }
  );
};

export const getDiscoverProfiles = async () => {
  const token = await getAuthToken();

  return apiRequest<DiscoverProfilesResponse>(
    "/profile/discover",
    {
      method: "GET",
      token,
    }
  );
};


export type PublicProfileDetail = {
  id: string;
  user?: string;
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
  createdAt?: string;
  updatedAt?: string;
};

export type PublicProfileDetailResponse = {
  success: boolean;
  data: {
    profile: PublicProfileDetail;
  };
};

export const getPublicProfile = async (
  profileId: string
): Promise<PublicProfileDetailResponse> => {
  if (!profileId) {
    throw new Error(
      "Profile ID is required"
    );
  }

  return apiRequest<PublicProfileDetailResponse>(
    `/profile/${profileId}`,
    {
      method: "GET",
    }
  );
};


export const getBecauseYouLikeProfiles =
  async (): Promise<BecauseYouLikeResponse> => {
    const token = await getSavedToken();

    if (!token) {
      throw new Error(
        "Please login again to view profiles based on your interests."
      );
    }

    return apiRequest<BecauseYouLikeResponse>(
      "/profile/because-you-like",
      {
        method: "GET",
        token,
      }
    );
  };


 export const getNewHereProfiles =
  async (): Promise<NewHereResponse> => {
    const token = await getSavedToken();

    if (!token) {
      throw new Error(
        "Please login again to view new profiles."
      );
    }

    return apiRequest<NewHereResponse>(
      "/profile/new-here",
      {
        method: "GET",
        token,
      }
    );
  };