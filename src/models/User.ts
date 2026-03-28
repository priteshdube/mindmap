import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: "student" | "professional";
  stressor: string;
  goal?: string;
  onboarded: boolean;
  emailNotifications: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    role: { type: String, enum: ["student", "professional"] },
    stressor: { type: String },
    goal: { type: String },
    onboarded: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
