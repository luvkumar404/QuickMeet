import { Server } from "socket.io";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_STORED_MESSAGES = 100;

export const connectToSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"]
        }
    });

    const rooms = new Map();
    const messages = new Map();

    io.on("connection", (socket) => {
        socket.on("join-call", (roomId) => {
            if (typeof roomId !== "string" || !roomId.trim() || roomId.length > 500) {
                return socket.emit("room-error", "A valid meeting room is required");
            }

            const room = roomId.trim();
            const previousRoom = socket.data.room;
            if (previousRoom && previousRoom !== room) {
                socket.leave(previousRoom);
                rooms.get(previousRoom)?.delete(socket.id);
            }

            socket.data.room = room;
            socket.join(room);

            if (!rooms.has(room)) rooms.set(room, new Set());
            rooms.get(room).add(socket.id);

            for (const clientId of rooms.get(room)) {
                io.to(clientId).emit("user-joined", socket.id, [...rooms.get(room)]);
            }

            for (const message of messages.get(room) || []) {
                socket.emit("chat-message", message.data, message.sender, message.socketId);
            }
        });

        socket.on("signal", (targetId, message) => {
            if (typeof targetId !== "string" || typeof message !== "string") return;
            const roomClients = rooms.get(socket.data.room);
            if (roomClients?.has(targetId)) {
                io.to(targetId).emit("signal", socket.id, message);
            }
        });

        socket.on("chat-message", (data, sender) => {
            const room = socket.data.room;
            if (!room || typeof data !== "string" || typeof sender !== "string") return;

            const cleanData = data.trim().slice(0, MAX_MESSAGE_LENGTH);
            const cleanSender = sender.trim().slice(0, 80);
            if (!cleanData || !cleanSender) return;

            const roomMessages = messages.get(room) || [];
            roomMessages.push({ data: cleanData, sender: cleanSender, socketId: socket.id });
            messages.set(room, roomMessages.slice(-MAX_STORED_MESSAGES));
            io.to(room).emit("chat-message", cleanData, cleanSender, socket.id);
        });

        socket.on("disconnect", () => {
            const room = socket.data.room;
            const roomClients = rooms.get(room);
            if (!roomClients) return;

            roomClients.delete(socket.id);
            socket.to(room).emit("user-left", socket.id);

            if (roomClients.size === 0) {
                rooms.delete(room);
                messages.delete(room);
            }
        });
    });

    return io;
};
