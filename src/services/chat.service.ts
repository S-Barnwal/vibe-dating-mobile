import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

export type ChatUser = {
  id: string;
  profileId: string;
  name: string;
  age: number | null;
  primaryPhoto: string | null;
  photos: string[];
  isVerified: boolean;
  lastActiveAt: string | null;
  gender?: string;
  bio?: string;
  description?: string;
  interests?: string[];
  datingIntention?: string;
  prompts?: {
    question: string;
    profileId: string;
    answer: string;
  }[];
};

export type ChatMessage = {
  id: string;
  conversation: string;
  sender: string;
  receiver: string;
  text: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  mine: boolean;
};

export type ConversationData = {
  otherUser: ChatUser;

  conversation: {
    id: string;
    participants: string[];
  };

  messages: ChatMessage[];
};

export type ConversationResponse = {
  success: boolean;
  data: ConversationData;
};

export type SendMessageResponse = {
  success: boolean;
  message: string;
  data: {
    message: ChatMessage;
  };
};

/*
 * ==========================================
 * SEARCH MESSAGE RESPONSE
 * ==========================================
 */

export type SearchMessagesResponse = {
  success: boolean;
  data: {
    messages: ChatMessage[];
    count: number;
  };
};

/*
 * ==========================================
 * GET TOKEN
 * ==========================================
 */

const getToken = async () => {
  const token = await getSavedToken();

  if (!token) {
    throw new Error(
      "Please login again to continue chatting."
    );
  }

  return token;
};

/*
 * ==========================================
 * GET CONVERSATION
 * ==========================================
 */

export const getConversation = async (
  userId: string
): Promise<ConversationResponse> => {
  if (!userId) {
    throw new Error(
      "Matched user is required."
    );
  }

  const token = await getToken();

  return apiRequest<ConversationResponse>(
    `/chat/${userId}`,
    {
      method: "GET",
      token,
    }
  );
};

/*
 * ==========================================
 * SEARCH MESSAGES
 * ==========================================
 */

export const searchMessages = async (
  userId: string,
  query: string
): Promise<SearchMessagesResponse> => {
  if (!userId) {
    throw new Error(
      "Matched user is required."
    );
  }

  if (!query.trim()) {
    throw new Error(
      "Search query is required."
    );
  }

  const token = await getToken();

  return apiRequest<SearchMessagesResponse>(
    `/chat/${userId}/search?q=${encodeURIComponent(
      query.trim()
    )}`,
    {
      method: "GET",
      token,
    }
  );
};

/*
 * ==========================================
 * SEND MESSAGE
 * ==========================================
 */

export const sendMessage = async (
  userId: string,
  text: string
): Promise<SendMessageResponse> => {
  if (!userId) {
    throw new Error(
      "Matched user is required."
    );
  }

  if (!text.trim()) {
    throw new Error(
      "Message cannot be empty."
    );
  }

  const token = await getToken();

  return apiRequest<SendMessageResponse>(
    `/chat/${userId}/messages`,
    {
      method: "POST",
      body: {
        text: text.trim(),
      },
      token,
    }
  );
};

/*
 * ==========================================
 * MARK MESSAGES AS READ
 * ==========================================
 */

export const markMessagesAsRead = async (
  userId: string
) => {
  if (!userId) {
    throw new Error(
      "Matched user is required."
    );
  }

  const token = await getToken();

  return apiRequest<{
    success: boolean;
    message: string;
  }>(
    `/chat/${userId}/read`,
    {
      method: "PATCH",
      token,
    }
  );
};