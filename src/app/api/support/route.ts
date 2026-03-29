import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { tag, score } = body;

    const user = await User.findOne({ clerkId: userId }).lean();
    const role = user?.role || "person";
    const stressor = user?.stressor || "life challenges";
    const goal = user?.goal || "personal growth";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `A ${role} feeling ${tag} with a mood score of ${score}/10 is dealing with ${stressor}. Their goal is: ${goal}. 

Return ONLY valid JSON with these exact keys:
- quote (string - inspirational quote)
- quoteAuthor (string)
- message (string - one warm empathetic sentence directed to user)
- uplifting_songs (array of 3 objects with: title, artist, spotifyQuery)
- motivational_videos (array of 2 objects with: title, youtubeSearchQuery for MOTIVATIONAL SPEAKER content)
- meditation_videos (array of 2 objects with: title, youtubeSearchQuery for MEDITATION/BREATHING/YOGA content)
- binaural_beats (array of 2 objects with: title, type (e.g., '10Hz Alpha', '40Hz Beta'), youtubeSearchQuery)

Focus on uplifting songs suited to ${tag}. Exclude sad or heavy music.`;

    const result = await ai.models.generateContent({ model, contents: prompt });
    const text = result.text ?? "";

    // Robust JSON extraction: handles markdown fences and preamble
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      } catch (parseError) {
        console.error("Gemini JSON parse failed:", parseError, "Raw:", text.substring(0, 500));
      }
    }

    throw new Error("Failed to parse Gemini response");
  } catch (error) {
    console.error("Support content error:", error);
    // Return fallback with enhanced structure
    return NextResponse.json({
      quote:
        "You don't have to control your thoughts. You just have to stop letting them control you.",
      quoteAuthor: "Dan Millman",
      message:
        "What you're feeling right now is valid, and it takes courage to acknowledge it.",
      uplifting_songs: [
        {
          title: "Here Comes The Sun",
          artist: "The Beatles",
          spotifyQuery: "Here Comes The Sun Beatles",
        },
        {
          title: "Three Little Birds",
          artist: "Bob Marley",
          spotifyQuery: "Three Little Birds Bob Marley",
        },
        {
          title: "Lovely Day",
          artist: "Bill Withers",
          spotifyQuery: "Lovely Day Bill Withers",
        },
      ],
      motivational_videos: [
        {
          title: "How to Overcome Self-Doubt",
          youtubeSearchQuery: "motivational speaker overcome self doubt",
        },
        {
          title: "Change Your Mindset",
          youtubeSearchQuery: "powerful motivational speech change mindset",
        },
      ],
      meditation_videos: [
        {
          title: "5-Minute Breathing Exercise",
          youtubeSearchQuery: "5 minute breathing exercise anxiety relief",
        },
        {
          title: "Guided Meditation",
          youtubeSearchQuery: "10 minute guided meditation relaxation",
        },
      ],
      binaural_beats: [
        {
          title: "Relaxation & Calm",
          type: "10Hz Alpha Waves",
          youtubeSearchQuery: "10Hz alpha waves relaxation meditation",
        },
        {
          title: "Focus & Clarity",
          type: "40Hz Beta Waves",
          youtubeSearchQuery: "40Hz beta waves focus concentration",
        },
      ],
    });
  }
}
