import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resumeUrl: { type: String },
    resumeText: { type: String },
    skills: [{ type: String }],
    preferredRoles: [{ type: String }],
    resumeAnalysis: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
