import { io, Socket } from "socket.io-client";
import { getSavedToken } from "./auth.service";

const SOCKET_URL = "http://192.168.29.162:5000";

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket | null> => {
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  const token = await getSavedToken();

  if (!token) {
    console.log("No auth token found for socket");
    return null;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
};

export const getSocket = () => socket;

/*
|--------------------------------------------------------------------------
| Subscribe to socket event
|--------------------------------------------------------------------------
*/

export const subscribeToSocketEvent = <T = unknown>(
  event: string,
  callback: (data: T) => void
) => {
  if (!socket) {
    console.warn(
      `Socket is not initialized. Event "${event}" cannot be subscribed yet.`
    );

    return () => {};
  }

  socket.on(event, callback);

  return () => {
    socket?.off(event, callback);
  };
};

/*
|--------------------------------------------------------------------------
| Emit socket event
|--------------------------------------------------------------------------
*/

export const emitSocketEvent = (
  event: string,
  data?: unknown
) => {
  if (!socket?.connected) {
    console.warn(
      `Cannot emit "${event}". Socket is not connected.`
    );

    return;
  }

  socket.emit(event, data);
};

/*
|--------------------------------------------------------------------------
| Disconnect
|--------------------------------------------------------------------------
*/

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};