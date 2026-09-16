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


/*
 * Profile returned inside Likes section.
 */
export type LikeProfile = {
  id: string;
  userId: string;

  name: string | null;
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

  /*
   * For Your Likes:
   * like / superlike
   */
  interactionType?: "like" | "superlike";

  likedAt?: string;
};


/*
 * Response returned by both:
 *
 * /sent-likes
 * /received-likes
 */
export type LikesResponse = {
  success: boolean;

  data: {
    likes: LikeProfile[];
    count: number;
  };
};


/*
 * Send Like / Pass / Super Like
 */
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

      // apiRequest khud JSON.stringify karega.
      body: {
        toUserId,
      },

      token,
    }
  );
};


/*
 * Like a profile
 */
export const likeProfile = async (
  toUserId: string
) => {
  return sendInteraction("like", toUserId);
};


/*
 * Pass a profile
 */
export const passProfile = async (
  toUserId: string
) => {
  return sendInteraction("pass", toUserId);
};


/*
 * Super Like a profile
 */
export const superlikeProfile = async (
  toUserId: string
) => {
  return sendInteraction(
    "superlike",
    toUserId
  );
};


/*
 * Get profiles that I liked or super-liked.
 *
 * Discover
 *    ↓
 * Like / Super Like
 *    ↓
 * MongoDB Interaction
 *    ↓
 * Your Likes
 */
export const getSentLikes =
  async (): Promise<LikesResponse> => {
    const token = await getSavedToken();

    if (!token) {
      throw new Error(
        "Please login again to view your likes."
      );
    }

    return apiRequest<LikesResponse>(
      "/interactions/sent-likes",
      {
        method: "GET",
        token,
      }
    );
  };


/*
 * Get profiles that liked me.
 *
 * Other User
 *    ↓
 * Like Me
 *    ↓
 * MongoDB Interaction
 *    ↓
 * See Who Liked You
 */
export const getReceivedLikes =
  async (): Promise<LikesResponse> => {
    const token = await getSavedToken();

    if (!token) {
      throw new Error(
        "Please login again to view people who liked you."
      );
    }

    return apiRequest<LikesResponse>(
      "/interactions/received-likes",
      {
        method: "GET",
        token,
      }
    );
  };
  