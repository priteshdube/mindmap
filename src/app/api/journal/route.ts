import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import JournalEntry from "@/models/JournalEntry";
import User from "@/models/User";
import { GoogleGenAI, Type } from "@google/genai";

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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

      if (!plainText.trim()) {
        console.warn(
          "Journal AI: stripped entry text was empty; skipping Gemini (HTML had no readable text)."
        );
      } else {
        const prompt = `Analyze this journal entry written by a ${role} dealing with ${stressor}.

Respond with JSON only (schema enforced). Tone = one emotion word. Summary = two empathetic sentences that reflect what they actually wrote. Suggestion = one specific actionable tip for their situation.

Entry:
${plainText}`;

        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["tone", "summary", "suggestion"],
              properties: {
                tone: {
                  type: Type.STRING,
                  description: "Single emotion word for the entry",
                },
                summary: {
                  type: Type.STRING,
                  description:
                    "Two empathetic sentences reflecting what the user expressed",
                },
                suggestion: {
                  type: Type.STRING,
                  description:
                    "One specific actionable tip relevant to their situation",
                },
              },
            },
          },
        });

        const text = result.text?.trim() ?? "";
        if (!text) {
          console.warn(
            "Journal AI: Gemini returned empty text (no candidates or blocked response)."
          );
        } else {
          try {
            const parsed = JSON.parse(text) as {
              tone?: string;
              summary?: string;
              suggestion?: string;
            };
            if (parsed.tone && parsed.summary && parsed.suggestion) {
              aiSummary = {
                tone: String(parsed.tone).trim(),
                summary: String(parsed.summary).trim(),
                suggestion: String(parsed.suggestion).trim(),
              };
            } else {
              console.warn(
                "Journal AI: parsed JSON missing tone/summary/suggestion keys:",
                text.substring(0, 400)
              );
            }
          } catch (e) {
            console.error(
              "Journal AI: JSON parse failed after structured output:",
              e,
              "Raw:",
              text.substring(0, 400)
            );
          }
        }
      }
    } catch (geminiError) {
      console.error("Gemini AI analysis failed:", geminiError);
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
