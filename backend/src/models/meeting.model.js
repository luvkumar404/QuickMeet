import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    user_id: { type: String, trim: true, index: true },
    meetingCode: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: Date, default: Date.now, required: true }
}, { versionKey: false });

export const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);
