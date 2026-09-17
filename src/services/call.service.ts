import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

export type CallStatus =
  | "ringing"
  | "accepted"
  | "rejected"
  | "ended"
  | "missed"
  | "cancelled";

export interface CallUser {
  _id: string;
  name?: string;
  username?: string;
  profileImage?: string;
}

export interface Call {
  _id: string;
  caller: CallUser;
  receiver: CallUser;
  type: "voice";
  status: CallStatus;
  channelName: string;
  startedAt: string;
  answeredAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

type CallResponse = {
  success: boolean;
  message: string;
  call: Call;
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

export const startCall = async (
  receiverId: string
): Promise<Call> => {
  const token = await getAuthToken();

  const response =
    await apiRequest<CallResponse>(
      "/calls/start",
      {
        method: "POST",
        body: {
          receiverId,
        },
        token,
      }
    );

  return response.call;
};

export const acceptCall = async (
  callId: string
): Promise<Call> => {
  const token = await getAuthToken();

  const response =
    await apiRequest<CallResponse>(
      `/calls/${callId}/accept`,
      {
        method: "PATCH",
        token,
      }
    );

  return response.call;
};

export const rejectCall = async (
  callId: string
): Promise<Call> => {
  const token = await getAuthToken();

  const response =
    await apiRequest<CallResponse>(
      `/calls/${callId}/reject`,
      {
        method: "PATCH",
        token,
      }
    );

  return response.call;
};

export const endCall = async (
  callId: string
): Promise<Call> => {
  const token = await getAuthToken();

  const response =
    await apiRequest<CallResponse>(
      `/calls/${callId}/end`,
      {
        method: "PATCH",
        token,
      }
    );

  return response.call;
};