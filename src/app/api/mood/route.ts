import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import MoodLog from "@/models/MoodLog";
import User from "@/models/User";
import { sendLowMoodEmail } from "@/lib/emails";
import { GoogleGenAI } from "@google/genai";

async function buildMoodInsight(score: number, tag: string, note: string): Promise<string> {
  const fallback =
    score <= 4
      ? "You took an honest first step today; one small kind action for yourself is enough right now."
      : "You are building a healthy check-in habit, and that consistency will help you keep your momentum.";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
    const prompt = `Write exactly one short supportive sentence (max 22 words), in second person, based on this mood check-in. No quotes, no emojis, no list, no markdown.\nScore: ${score}/10\nTags: ${tag || "none"}\nNote: ${note || "none"}`;

    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = (result.text || "").replace(/\s+/g, " ").trim();
    if (!text) return fallback;

    const oneLine = text.split(/[\n\.]/)[0]?.trim() || text;
    return oneLine || fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await MoodLog.find({
      userId,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(logs)));
  } catch (error) {
    console.error("GET mood error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { score, tag, note } = body;

    const moodLog = await MoodLog.create({
      userId,
      score,
      tag,
      note: note || "",
    });

    const insight = await buildMoodInsight(score, tag || "", note || "");

    // Fire-and-forget email for low mood
    if (score <= 4) {
      try {
        const user = await User.findOne({ clerkId: userId }).lean();
        if (user && user.emailNotifications && user.email) {
          sendLowMoodEmail(user.name || "Friend", user.email).catch(() => { });
        }
      } catch {
        // Email failure must not affect mood save
      }
    }

    return NextResponse.json({
      success: true,
      moodLog: JSON.parse(JSON.stringify(moodLog)),
      redirect: score <= 4 ? "/support" : "/dashboard",
      insight,
    });
  } catch (error) {
    console.error("POST mood error:", error);
    return NextResponse.json(
      { error: "Failed to save mood" },
      { status: 500 }
    );
  }
}
