import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import JournalEntry from "@/models/JournalEntry";
import User from "@/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const entries = await JournalEntry.find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(entries)));
  } catch (error) {
    console.error("GET journal error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { title, content, moodScore } = body;

    // Get user context for Gemini
    const user = await User.findOne({ clerkId: userId }).lean();
    const role = user?.role || "person";
    const stressor = user?.stressor || "life challenges";

    // Strip HTML for AI analysis
    const plainText = stripHtml(content);

    // AI analysis
    let aiSummary = {
      tone: "reflective",
      summary: "Your thoughts have been saved safely.",
      suggestion:
        "Take a moment to breathe and be kind to yourself today.",
    };

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this journal entry written by a ${role} dealing with ${stressor}. Return ONLY valid JSON with exactly these keys: tone (single emotion word), summary (two empathetic sentences reflecting what the user expressed), suggestion (one specific actionable tip relevant to their situation). Entry: ${plainText}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.tone && parsed.summary && parsed.suggestion) {
          aiSummary = parsed;
        }
      }
    } catch {
      // Use fallback — Gemini failure must not crash
    }

    const entry = await JournalEntry.create({
      userId,
      title,
      content,
      moodScore: moodScore || undefined,
      aiSummary,
    });

    return NextResponse.json({
      success: true,
      entry: JSON.parse(JSON.stringify(entry)),
    });
  } catch (error) {
    console.error("POST journal error:", error);
    return NextResponse.json(
      { error: "Failed to save entry" },
      { status: 500 }
    );
  }
}
