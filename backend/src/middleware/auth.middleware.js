import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const getToken = (req) => {
    const authorization = req.get("authorization");
    if (authorization?.startsWith("Bearer ")) {
        return authorization.slice(7).trim();
    }
    return req.body?.token || req.query?.token;
};

export const authenticate = async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ success: false, message: "Authentication token is required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub).select("name username");
        if (!user) {
            return res.status(401).json({ success: false, message: "Authentication token is invalid" });
        }
        req.user = { id: user._id, name: user.name, username: user.username };
        return next();
    } catch {
        return res.status(401).json({ success: false, message: "Authentication token is invalid or expired" });
    }
};
