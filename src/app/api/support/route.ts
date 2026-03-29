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

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

    const prompt = `A ${role} feeling ${tag} with a mood score of ${score}/10 is dealing with ${stressor}. Their goal is: ${goal}. Return ONLY valid JSON with these exact keys: quote (string), quoteAuthor (string), message (one warm empathetic sentence addressed directly to the user), videos (array of 3 objects each with title and youtubeSearchQuery — match content specifically to the feeling of ${tag} not generic wellness), songs (array of 3 objects each with title, artist, spotifySearchQuery — songs must be uplifting and mood-lifting, never sad or heavy).`;

    const result = await ai.models.generateContent({ model, contents: prompt });
    const text = result.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    throw new Error("Failed to parse Gemini response");
  } catch (error) {
    console.error("Support content error:", error);
    // Return fallback
    return NextResponse.json({
      quote:
        "You don't have to control your thoughts. You just have to stop letting them control you.",
      quoteAuthor: "Dan Millman",
      message:
        "What you're feeling right now is valid, and it takes courage to acknowledge it.",
      videos: [
        {
          title: "5-Minute Breathing Exercise",
          youtubeSearchQuery: "5 minute breathing exercise for anxiety",
        },
        {
          title: "Grounding Technique",
          youtubeSearchQuery: "grounding technique 5 4 3 2 1 anxiety",
        },
        {
          title: "Self-Compassion Meditation",
          youtubeSearchQuery: "self compassion meditation 10 minutes",
        },
      ],
      songs: [
        {
          title: "Here Comes The Sun",
          artist: "The Beatles",
          spotifySearchQuery: "Here Comes The Sun Beatles",
        },
        {
          title: "Three Little Birds",
          artist: "Bob Marley",
          spotifySearchQuery: "Three Little Birds Bob Marley",
        },
        {
          title: "Lovely Day",
          artist: "Bill Withers",
          spotifySearchQuery: "Lovely Day Bill Withers",
        },
      ],
    });
  }
}
