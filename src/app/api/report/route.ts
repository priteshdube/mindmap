import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import MoodLog from "@/models/MoodLog";
import JournalEntry from "@/models/JournalEntry";
import User from "@/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

async function buildReport(userId: string, weekOffset: number) {
  const now = new Date();
  const weekStart = startOfWeek(subWeeks(now, weekOffset), {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(subWeeks(now, weekOffset), {
    weekStartsOn: 1,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const streakWindowStart = new Date(today);
  streakWindowStart.setDate(streakWindowStart.getDate() - 14);

  const [moods, journals, user, streakMoods] = await Promise.all([
    MoodLog.find({
      userId,
      date: { $gte: weekStart, $lte: weekEnd },
    })
      .sort({ date: 1 })
      .lean(),
    JournalEntry.find({
      userId,
      date: { $gte: weekStart, $lte: weekEnd },
    })
      .sort({ date: -1 })
      .lean(),
    User.findOne({ clerkId: userId }).lean(),
    MoodLog.find({
      userId,
      date: { $gte: streakWindowStart },
    }).lean(),
  ]);

  const avgMood =
    moods.length > 0
      ? Math.round(
          (moods.reduce((a, m) => a + m.score, 0) / moods.length) * 10
        ) / 10
      : 0;

  const tagCounts: Record<string, number> = {};
  moods.forEach((m) => {
    const tags = m.tag.split(", ");
    tags.forEach((t: string) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const topTag =
    Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const daySet = new Set(
    streakMoods.map((m) => format(new Date(m.date), "yyyy-MM-dd"))
  );
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dayStr = format(checkDate, "yyyy-MM-dd");
    if (daySet.has(dayStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  const moodNotesBlock = (() => {
    const lines = moods
      .filter((m) => m.note && String(m.note).trim())
      .map(
        (m) =>
          `- (${format(new Date(m.date), "EEE MMM d")}, mood ${m.score}/10): ${String(m.note).trim()}`
      );
    if (lines.length === 0) return "";
    return `

Mood check-in notes from this week:
${lines.join("\n")}`;
  })();

  let insight = "";
  const role = user?.role || "person";
  const stressor = user?.stressor || "life challenges";
  const goal = user?.goal || "personal growth";

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt: string;

    if (journals.length > 0) {
      const journalTexts = journals
        .map((j) => stripHtml(j.content))
        .join("\n---\n")
        .substring(0, 3000);

      prompt = `You are a compassionate wellness coach reviewing someone's week. This person is a ${role} whose main challenge is ${stressor}. Their personal goal is: ${goal}.

Their week in numbers: average mood ${avgMood}/10, most common feeling: ${topTag}, wrote ${journals.length} journal entries, logged ${streak} days in a row.

What they wrote this week:
---
${journalTexts}
${moodNotesBlock}

Write a 3-sentence insight. Sentence 1: name a specific emotional pattern or theme you noticed in their writing${moodNotesBlock ? " or mood notes" : ""} — be specific not generic. Sentence 2: acknowledge something they did well this week. Sentence 3: one gentle specific suggestion for the coming week connected to what they wrote. Tone: warm, direct, human — not clinical. Never use the phrases 'it seems' or 'it appears'.`;
    } else {
      prompt = `A ${role} dealing with ${stressor} had this week: avg mood ${avgMood}/10, top feeling ${topTag}, ${journals.length} journal entries, ${streak} day streak.${moodNotesBlock}

Write 3 warm encouraging sentences with one gentle suggestion for next week. Use mood notes if present to personalize.`;
    }

    const result = await model.generateContent(prompt);
    insight = result.response.text();
  } catch {
    insight =
      moods.length > 0
        ? `This week you showed up ${moods.length} time${moods.length > 1 ? "s" : ""} to check in with yourself — that matters more than you might think. Keep showing up for yourself.`
        : "";
  }

  const chartData = moods.map((m) => ({
    day: format(new Date(m.date), "EEE"),
    date: format(new Date(m.date), "MMM d"),
    score: m.score,
  }));

  return {
    stats: {
      avgMood,
      topTag,
      journalCount: journals.length,
      streak,
    },
    chartData: JSON.parse(JSON.stringify(chartData)),
    insight,
  };
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const raw = body.week;
    const weekOffset =
      typeof raw === "number" && !Number.isNaN(raw)
        ? Math.min(3, Math.max(0, Math.floor(raw)))
        : 0;

    const report = await buildReport(userId, weekOffset);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

/** @deprecated Prefer POST from the UI so reports are user-triggered. */
export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const weekOffset = parseInt(searchParams.get("week") || "0", 10);
    const safe = Number.isNaN(weekOffset)
      ? 0
      : Math.min(3, Math.max(0, weekOffset));

    const report = await buildReport(userId, safe);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
