/**
 * Seeds demo mood logs and journal entries for a Clerk user ID.
 *
 * Usage:
 *   node scripts/seed-demo.mjs <clerk_user_id>
 *
 * Or set SEED_CLERK_USER_ID in .env.local (loaded automatically from project root).
 *
 * Requires MONGODB_URI in .env.local or environment.
 */

import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  addDays,
  setHours,
} from "date-fns";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const p = resolve(root, ".env.local");
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const MoodLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    tag: { type: String, required: true },
    note: { type: String, maxlength: 280, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const JournalEntrySchema = new mongoose.Schema(
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

const MoodLog =
  mongoose.models.MoodLog || mongoose.model("MoodLog", MoodLogSchema);
const JournalEntry =
  mongoose.models.JournalEntry ||
  mongoose.model("JournalEntry", JournalEntrySchema);

const TAG_POOL = [
  "Calm",
  "Grateful",
  "Stressed",
  "Hopeful",
  "Tired",
  "Focused",
];

function pickTag() {
  const a = TAG_POOL[Math.floor(Math.random() * TAG_POOL.length)];
  const b = TAG_POOL[Math.floor(Math.random() * TAG_POOL.length)];
  return a === b ? a : `${a}, ${b}`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI. Set it in .env.local or the environment.");
    process.exit(1);
  }

  const clerkId =
    process.argv[2] || process.env.SEED_CLERK_USER_ID || process.env.CLERK_USER_ID;
  if (!clerkId) {
    console.error(
      "Pass your Clerk user id: node scripts/seed-demo.mjs user_xxxxxxxx\n" +
        "Or set SEED_CLERK_USER_ID in .env.local"
    );
    process.exit(1);
  }

  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Connected. Seeding for userId:", clerkId);

  const now = new Date();

  const moodDocs = [];
  const journalDocs = [];

  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const ws = startOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 1 });
    const we = endOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 1 });

    for (let d = 0; d < 7; d++) {
      const day = addDays(ws, d);
      if (day > we) break;
      if (day > now) continue;

      if (Math.random() < 0.35) continue;

      const score = 4 + Math.floor(Math.random() * 6);
      const at = setHours(day, 9 + Math.floor(Math.random() * 8));
      moodDocs.push({
        userId: clerkId,
        score,
        tag: pickTag(),
        note:
          Math.random() < 0.5
            ? ""
            : [
                "Short walk helped.",
                "Lots on my plate.",
                "Talked to a friend.",
                "Slept better last night.",
                "Deadline stress.",
              ][Math.floor(Math.random() * 5)],
        date: at,
      });
    }

    if (weekOffset < 3 && Math.random() < 0.85) {
      const titles = [
        "Week reflection",
        "Small wins",
        "What felt heavy",
        "Notes to self",
      ];
      const bodies = [
        "<p>Trying to balance work and rest. Some days feel easier than others.</p>",
        "<p>Grateful for coffee and a clear hour to think. Still figuring out next steps.</p>",
        "<p>Spoke up in a meeting — awkward but worth it. Want to keep practicing.</p>",
      ];
      const jd = addDays(ws, 2 + Math.floor(Math.random() * 4));
      if (jd <= now) {
        journalDocs.push({
          userId: clerkId,
          title: titles[weekOffset % titles.length],
          content: bodies[weekOffset % bodies.length],
          moodScore: 5 + Math.floor(Math.random() * 4),
          aiSummary: {
            tone: ["reflective", "hopeful", "tired"][weekOffset % 3],
            summary: "Demo summary for seed data.",
            suggestion: "Take one small break tomorrow.",
          },
          date: setHours(jd, 20),
        });
      }
    }
  }

  if (moodDocs.length) {
    await MoodLog.insertMany(moodDocs);
    console.log("Inserted mood logs:", moodDocs.length);
  }
  if (journalDocs.length) {
    await JournalEntry.insertMany(journalDocs);
    console.log("Inserted journal entries:", journalDocs.length);
  }

  if (!moodDocs.length && !journalDocs.length) {
    console.log("Nothing to insert (date window empty).");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
