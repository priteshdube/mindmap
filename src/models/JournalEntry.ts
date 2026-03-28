import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAiSummary {
  tone: string;
  summary: string;
  suggestion: string;
}

export interface IJournalEntry extends Document {
  userId: string;
  title: string;
  content: string;
  moodScore?: number;
  aiSummary?: IAiSummary;
  date: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    moodScore: { type: Number, min: 1, max: 10 },
    aiSummary: {
      tone: { type: String },
      summary: { type: String },
      suggestion: { type: String },
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const JournalEntry: Model<IJournalEntry> =
  mongoose.models.JournalEntry ||
  mongoose.model<IJournalEntry>("JournalEntry", JournalEntrySchema);

export default JournalEntry;
