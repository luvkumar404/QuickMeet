import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Meeting } from "../models/meeting.model.js";
import { User } from "../models/user.model.js";

const normalizeUsername = (username) => username.trim().toLowerCase();
const usernameQuery = (username) => ({
    username: new RegExp(`^${normalizeUsername(username).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
});

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    username: user.username
});

export const register = async (req, res, next) => {
    try {
        const name = req.body.name?.trim();
        const username = req.body.username?.trim();
        const password = req.body.password;

        if (!name || !username || !password) {
            return res.status(400).json({ success: false, message: "Name, username, and password are required" });
        }
        if (name.length < 2 || name.length > 80) {
            return res.status(400).json({ success: false, message: "Name must be between 2 and 80 characters" });
        }
        if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
            return res.status(400).json({
                success: false,
                message: "Username must be 3-30 characters and use only letters, numbers, dots, underscores, or hyphens"
            });
        }
        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({ success: false, message: "Password must be between 8 and 72 characters" });
        }

        const normalizedUsername = normalizeUsername(username);
        const existingUser = await User.exists(usernameQuery(normalizedUsername));
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Username is already registered" });
        }

        const user = await User.create({
            name,
            username: normalizedUsername,
            password: await bcrypt.hash(password, 12)
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: { user: publicUser(user) }
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "Username is already registered" });
        }
        return next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const username = req.body.username?.trim();
        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const user = await User.findOne(usernameQuery(username)).select("+password");
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { sub: user._id.toString(), username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: { token, user: publicUser(user) },
            token
        });
    } catch (error) {
        return next(error);
    }
};

export const getUserHistory = async (req, res, next) => {
    try {
        const meetings = await Meeting.find({
            $or: [{ user: req.user.id }, { user_id: req.user.username }]
        })
            .sort({ date: -1 })
            .select("meetingCode date");

        return res.status(200).json({
            success: true,
            message: "Meeting history retrieved",
            data: { meetings }
        });
    } catch (error) {
        return next(error);
    }
};

export const addToHistory = async (req, res, next) => {
    try {
        const meetingCode = (req.body.meetingCode ?? req.body.meeting_code)?.trim();
        if (!meetingCode) {
            return res.status(400).json({ success: false, message: "Meeting code is required" });
        }
        if (!/^[a-zA-Z0-9_-]{3,100}$/.test(meetingCode)) {
            return res.status(400).json({
                success: false,
                message: "Meeting code must be 3-100 characters and use only letters, numbers, underscores, or hyphens"
            });
        }

        const meeting = await Meeting.create({
            user: req.user.id,
            user_id: req.user.username,
            meetingCode
        });

        return res.status(201).json({
            success: true,
            message: "Meeting added to history",
            data: { meeting }
        });
    } catch (error) {
        return next(error);
    }
};

export const getCurrentUser = (req, res) => res.status(200).json({
    success: true,
    message: "Authenticated user retrieved",
    data: { user: req.user }
});
