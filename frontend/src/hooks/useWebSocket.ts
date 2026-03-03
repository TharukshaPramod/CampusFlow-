import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

export function useWebSocket(url: string, onConnect?: (socket: Socket) => void) {
  useEffect(() => {
    const socket = io(url, { transports: ["websocket"] });
    if (onConnect) {
      socket.on("connect", () => onConnect(socket));
    }
    return () => {
      socket.disconnect();
    };
  }, [url, onConnect]);
}
