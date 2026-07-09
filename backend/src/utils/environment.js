const requiredVariables = ["MONGODB_URI", "JWT_SECRET"];

export const validateEnvironment = () => {
    const missing = requiredVariables.filter((key) => !process.env[key]?.trim());
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters");
    }
};

export const getAllowedOrigins = () => {
    const configured = process.env.CORS_ORIGIN || "http://localhost:5173";
    return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
};
