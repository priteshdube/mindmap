import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMoodLog extends Document {
  userId: string;
  score: number;
  tag: string;
  note: string;
  date: Date;
}

const MoodLogSchema = new Schema<IMoodLog>(
  {
    userId: { type: String, required: true, index: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    tag: { type: String, required: true },
    note: { type: String, maxlength: 280, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MoodLog: Model<IMoodLog> =
  mongoose.models.MoodLog || mongoose.model<IMoodLog>("MoodLog", MoodLogSchema);

export default MoodLog;
