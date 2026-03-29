/**
 * Seeds realistic demo journal entries for a Clerk user ID.
 *
 * Usage:
 *   node scripts/seed-journal-demo.mjs <clerk_user_id> [count]
 *
 * Options:
 *   --clear    Delete existing journal entries for this user before insert
 */

import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { subDays, setHours, setMinutes } from "date-fns";

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

const JournalEntry =
	mongoose.models.JournalEntry ||
	mongoose.model("JournalEntry", JournalEntrySchema);

const DEMO_ENTRIES = [
	{
		title: "A steadier morning than usual",
		paragraphs: [
			"I woke up ten minutes before my alarm and noticed I was not carrying that immediate feeling of dread I usually have on weekdays.",
			"Instead of reaching for my phone, I made tea and sat near the window while the street was still quiet. I wrote down three things I could control today: how I spoke to myself, how I used my first hour, and whether I paused before reacting.",
			"Work was still full of interruptions, but I did not feel as scattered as I did earlier this week. I kept returning to my list when my attention drifted.",
			"By evening I was tired, but not emotionally exhausted. That feels like progress, and I want to remember this version of the day.",
		],
		moodScore: 7,
		tone: "steady",
		suggestion: "Repeat this low-stimulation morning for three days and track how your focus shifts.",
	},
	{
		title: "The kind of day that drains you slowly",
		paragraphs: [
			"Today felt like trying to write in the middle of a noisy hallway. Every time I started one task, a new message or meeting request pulled me away.",
			"I could feel my patience thinning by mid-afternoon, and I caught myself rereading the same paragraph four times without understanding it.",
			"I wanted to call the day a failure, but that was not fair. I did finish one task that had been hanging over me for a week, and I handled a difficult conversation without snapping.",
			"I am ending the day with low energy but some perspective: not every productive day looks clean.",
		],
		moodScore: 5,
		tone: "drained",
		suggestion: "Block one protected focus hour tomorrow and silence notifications during that window.",
	},
	{
		title: "A small conversation I almost avoided",
		paragraphs: [
			"I finally sent a message I had been postponing for days because I kept imagining the worst possible response.",
			"The reply came quickly and was warm, simple, and far less dramatic than the story I had built in my head.",
			"It is strange how anxiety makes delay feel safe, even when delay is what increases the stress.",
			"Tonight I feel lighter, mostly because I stopped negotiating with fear and took one concrete step.",
		],
		moodScore: 8,
		tone: "relieved",
		suggestion: "Use a two-minute timer for the next message you are avoiding and send before it ends.",
	},
	{
		title: "Restless night, crowded mind",
		paragraphs: [
			"I slept in short fragments last night, and by morning my thoughts were already moving faster than my body.",
			"The smallest tasks felt heavy, and I kept jumping between tabs without finishing what I started.",
			"After lunch I took a quiet walk without headphones, and that helped settle me more than I expected.",
			"I need to stop pretending sleep hygiene is optional. Days like this are expensive.",
		],
		moodScore: 4,
		tone: "restless",
		suggestion: "Set a strict 45-minute no-screen window before bed for the next week.",
	},
	{
		title: "A quiet Sunday that repaired me",
		paragraphs: [
			"Today was slow in the best possible way. No urgency, no performative productivity, no chasing ten tasks at once.",
			"I cleaned my desk, changed my sheets, and cooked something simple. None of it was impressive, but each small action made the apartment feel calmer.",
			"I spent an hour reading without checking notifications, and I noticed my breathing had settled by the end of it.",
			"It was not a high-output day, but it was restorative. I need to protect days like this instead of feeling guilty about them.",
		],
		moodScore: 8,
		tone: "restored",
		suggestion: "Schedule one low-noise recovery block every weekend and treat it as non-negotiable.",
	},
	{
		title: "When the plan breaks at noon",
		paragraphs: [
			"A task I expected to finish in an hour took almost the entire afternoon because of one hidden dependency after another.",
			"Around 3 PM I felt the frustration surge. I wanted to give up on the whole checklist and call the day ruined.",
			"Instead, I rewrote the goal: finish one clear section and document the blockers for tomorrow.",
			"I still ended with unfinished work, but I also ended with direction, which is better than ending with panic.",
		],
		moodScore: 6,
		tone: "frustrated",
		suggestion: "Break tomorrow's top priority into three concrete checkpoints before you begin.",
	},
	{
		title: "Comparison stole my energy today",
		paragraphs: [
			"I spent too much time comparing my progress to people who are in completely different seasons of life.",
			"By the time I realized what I was doing, I had already convinced myself I was behind in everything.",
			"When I stepped back, I noticed the comparison was unfair: I was measuring their highlights against my unedited middle.",
			"I want to get back to a quieter standard: consistency, honesty, and one meaningful step at a time.",
		],
		moodScore: 4,
		tone: "insecure",
		suggestion: "Write three concrete wins from your own week before opening social apps.",
	},
	{
		title: "A better evening transition",
		paragraphs: [
			"I tried a deliberate transition after work today instead of carrying stress straight into the evening.",
			"I took a quick shower, changed clothes, and sat in silence for ten minutes without scrolling.",
			"The difference was immediate. I felt less reactive and more present during dinner.",
			"It reminded me that recovery does not need to be elaborate. It just needs to be intentional.",
		],
		moodScore: 7,
		tone: "balanced",
		suggestion: "Create a fixed 15-minute post-work reset ritual and repeat it daily.",
	},
	{
		title: "Late-night clarity",
		paragraphs: [
			"I have been postponing one decision for days, hoping the right answer would appear on its own.",
			"Tonight I finally wrote the options on paper, with pros, risks, and what each choice would cost me in energy.",
			"Seeing it outside my head made it less dramatic and more manageable.",
			"I still do not have perfect certainty, but I have enough clarity to take the next step.",
		],
		moodScore: 6,
		tone: "reflective",
		suggestion: "Move major decisions to earlier hours and write them out before evaluating.",
	},
	{
		title: "Tiny progress, but real",
		paragraphs: [
			"I practiced for thirty minutes today and wanted to quit after the first five.",
			"The skill still feels awkward, and part of me keeps expecting overnight improvement.",
			"But when I compared today to last week, I could see real gains in control and confidence.",
			"Slow progress is still progress. I want to stop dismissing it just because it is not dramatic.",
		],
		moodScore: 7,
		tone: "determined",
		suggestion: "Track weekly practice wins in one place so slow progress stays visible.",
	},
];

function toHtml(paragraphs) {
	return paragraphs.map((p) => `<p>${p}</p>`).join("");
}

function parseCount(raw) {
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) return 20;
	return Math.min(Math.floor(n), 120);
}

function randomDateWithin(daysBack) {
	const d = subDays(new Date(), Math.floor(Math.random() * daysBack));
	const withHour = setHours(d, 7 + Math.floor(Math.random() * 15));
	return setMinutes(withHour, Math.floor(Math.random() * 60));
}

function looksLikePlaceholderClerkId(value) {
	if (!value) return true;
	const lowered = String(value).trim().toLowerCase();
	if (lowered === "your_clerk_user_id") return true;
	if (lowered.includes("your") && lowered.includes("user")) return true;
	return false;
}

async function main() {
	const uri = process.env.MONGODB_URI;
	if (!uri) {
		console.error("Missing MONGODB_URI. Set it in .env.local or environment.");
		process.exit(1);
	}

	const argv = process.argv.slice(2);
	const clearFirst = argv.includes("--clear");
	const nonFlags = argv.filter((a) => !a.startsWith("--"));

	const clerkId =
		nonFlags[0] || process.env.SEED_CLERK_USER_ID || process.env.CLERK_USER_ID;
	if (!clerkId || looksLikePlaceholderClerkId(clerkId)) {
		console.error(
			"Pass a real Clerk user id (starts with user_).\n" +
				"Example: npm run seed:journal -- user_abc123 20 --clear"
		);
		process.exit(1);
	}

	const count = parseCount(nonFlags[1]);

	await mongoose.connect(uri, { bufferCommands: false });
	console.log("Connected. Seeding journal entries for userId:", clerkId);

	if (clearFirst) {
		const deleted = await JournalEntry.deleteMany({ userId: clerkId });
		console.log("Deleted existing journal entries:", deleted.deletedCount || 0);
	}

	const docs = [];
	for (let i = 0; i < count; i++) {
		const seed = DEMO_ENTRIES[i % DEMO_ENTRIES.length];
		const date = randomDateWithin(60);
		docs.push({
			userId: clerkId,
			title: seed.title,
			content: toHtml(seed.paragraphs),
			moodScore: seed.moodScore,
			aiSummary: {
				tone: seed.tone,
				summary: seed.paragraphs.slice(0, 2).join(" "),
				suggestion: seed.suggestion,
			},
			date,
		});
	}

	docs.sort((a, b) => a.date - b.date);
	await JournalEntry.insertMany(docs);

	console.log("Inserted journal entries:", docs.length);
	await mongoose.disconnect();
	console.log("Done.");
}

main().catch(async (err) => {
	console.error(err);
	try {
		await mongoose.disconnect();
	} catch {
		// ignore disconnect errors
	}
	process.exit(1);
});
