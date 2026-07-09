import "dotenv/config";
import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import userRoutes from "./routes/users.routes.js";
import { getAllowedOrigins, validateEnvironment } from "./utils/environment.js";

export const createApp = () => {
    const app = express();
    const allowedOrigins = getAllowedOrigins();

    app.disable("x-powered-by");
    app.use(cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Origin is not allowed by CORS"));
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }));
    app.use(express.json({ limit: "40kb" }));
    app.use(express.urlencoded({ limit: "40kb", extended: true }));

    app.get("/api/v1/health", (_req, res) => {
        res.status(200).json({
            success: true,
            message: "QuickMeet API is healthy",
            data: { database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }
        });
    });
    app.use("/api/v1/users", userRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

export const startServer = async () => {
    validateEnvironment();

    const app = createApp();
    const server = createServer(app);
    connectToSocket(server, getAllowedOrigins());

    await mongoose.connect(process.env.MONGODB_URI);

    const port = Number(process.env.PORT) || 8000;
    server.listen(port, () => {
        console.log(`QuickMeet API listening on http://localhost:${port}`);
    });

    const shutdown = async (signal) => {
        console.log(`${signal} received, shutting down`);
        await mongoose.disconnect();
        server.close(() => process.exit(0));
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));

    return server;
};

if (process.env.NODE_ENV !== "test") {
    startServer().catch((error) => {
        console.error("Failed to start QuickMeet API:", error.message);
        process.exit(1);
    });
}
