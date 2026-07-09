import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password: { type: String, required: true, select: false }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
