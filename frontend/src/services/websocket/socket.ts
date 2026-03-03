import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_WS_URL ?? "http://localhost:8080/ws", {
      transports: ["websocket"]
    });
  }
  return socket;
}
