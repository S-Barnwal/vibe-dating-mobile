import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

export type BlockedUser = {
  blockId: string;
  userId: string;
  name: string;
  age: number | null;
  primaryPhoto: string | null;
  photos: string[];
  gender?: string;
  bio?: string;
  isVerified: boolean;
  blockedAt: string;
};

export type BlockedUsersResponse = {
  success: boolean;
  data: {
    users: BlockedUser[];
    count: number;
  };
};

export type BlockStatusResponse = {
  success: boolean;
  data: {
    isBlocked: boolean;
    blockedByOther: boolean;
  };
};

export type BlockResponse = {
  success: boolean;
  message: string;
  data?: {
    block?: {
      id: string;
      blocker: string;
      blocked: string;
    };
  };
};

const getToken = async () => {
  const token = await getSavedToken();

  if (!token) {
    throw new Error(
      "Please login again."
    );
  }

  return token;
};

export const getBlockedUsers =
  async (): Promise<BlockedUsersResponse> => {
    const token = await getToken();

    return apiRequest<BlockedUsersResponse>(
      "/blocks",
      {
        method: "GET",
        token,
      }
    );
  };

export const getBlockStatus = async (
  userId: string
): Promise<BlockStatusResponse> => {
  if (!userId) {
    throw new Error(
      "User is required."
    );
  }

  const token = await getToken();

  return apiRequest<BlockStatusResponse>(
    `/blocks/${userId}/status`,
    {
      method: "GET",
      token,
    }
  );
};

export const blockUser = async (
  userId: string
): Promise<BlockResponse> => {
  if (!userId) {
    throw new Error(
      "User is required."
    );
  }

  const token = await getToken();

  return apiRequest<BlockResponse>(
    `/blocks/${userId}`,
    {
      method: "POST",
      token,
    }
  );
};

export const unblockUser = async (
  userId: string
): Promise<BlockResponse> => {
  if (!userId) {
    throw new Error(
      "User is required."
    );
  }

  const token = await getToken();

  return apiRequest<BlockResponse>(
    `/blocks/${userId}`,
    {
      method: "DELETE",
      token,
    }
  );
};