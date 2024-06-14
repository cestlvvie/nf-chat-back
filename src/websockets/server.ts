import { Server } from "socket.io";
import { SocketIOService } from "./service";
import { SOCKET_EVENTS } from "../consts";

export default (expressServer) => {
  SocketIOService.instance().initialize(expressServer, {
    cors: {
      origin: "https://nf-chat-frontend.vercel.app",
    },
  });

  const io = SocketIOService.instance().getServer();
  const onlineUsers = new Set<string>();

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      onlineUsers.add(userId);
      io.emit(SOCKET_EVENTS.USER_ONLINE, userId);
    }

    socket.on(SOCKET_EVENTS.JOIN_CHAT, async ({ chatId }) => {
      const room = chatId;
      console.log("joining room", room);
      if (io.sockets.adapter.rooms.get(room) && io.sockets.adapter.rooms.get(room)!.size > 0) {
        socket.emit(SOCKET_EVENTS.PARTNER_JOINED);
      }
      socket.to(room).emit(SOCKET_EVENTS.PARTNER_JOINED);
      socket.join(room);
    });

    socket.on(SOCKET_EVENTS.TYPING, ({ chatId }) => {
      socket.to(chatId).emit(SOCKET_EVENTS.TYPING);
    });

    socket.on(SOCKET_EVENTS.LEAVE_CHAT, async ({ chatId }) => {
      const room = chatId;
      socket.leave(room);
      socket.to(room).emit(SOCKET_EVENTS.PARTNER_LEFT);
    });

    socket.on(SOCKET_EVENTS.JOIN_CHATS_LIST, async ({ userId }) => {
      const room = `${userId}_chats`;
      socket.join(room);
    });

    socket.on(SOCKET_EVENTS.LEAVE_CHATS_LIST, async ({ userId }) => {
      const room = `${userId}_chats`;
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      if (userId) {
        onlineUsers.delete(userId);
        io.emit(SOCKET_EVENTS.USER_OFFLINE, userId);
      }
    });

    io.of("/").adapter.on("leave-room", (room, id) => {
      socket.to(room).emit(SOCKET_EVENTS.PARTNER_LEFT);
    });
  });

  return io;
};
