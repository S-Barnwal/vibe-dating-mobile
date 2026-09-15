import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

export type InteractionType =
  | "like"
  | "pass"
  | "superlike";

export type InteractionResponse = {
  success: boolean;
  message: string;
  data: {
    interaction: {
      id: string;
      toUser: string;
      type: InteractionType;
      createdAt: string;
      updatedAt: string;
    };
  };
};

const sendInteraction = async (
  endpoint: string,
  toUserId: string
): Promise<InteractionResponse> => {
  if (!toUserId) {
    throw new Error("Target user is required");
  }

  const token = await getSavedToken();

  if (!token) {
    throw new Error("Please login again");
  }

  return apiRequest<InteractionResponse>(
    `/interactions/${endpoint}`,
    {
      method: "POST",

      // IMPORTANT:
      // apiRequest khud JSON.stringify karega.
      body: {
        toUserId,
      },

      token,
    }
  );
};

export const likeProfile = async (
  toUserId: string
) => {
  return sendInteraction("like", toUserId);
};

export const passProfile = async (
  toUserId: string
) => {
  return sendInteraction("pass", toUserId);
};

export const superlikeProfile = async (
  toUserId: string
) => {
  return sendInteraction("superlike", toUserId);
};