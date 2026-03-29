import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import MoodLog from "@/models/MoodLog";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { reply: "API configuration error. Please contact support." },
        { status: 500 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { messages } = body;

    const user = await User.findOne({ clerkId: userId }).lean();
    const role = user?.role || "person";
    const stressor = user?.stressor || "life challenges";
    const goal = user?.goal || "personal growth";

    // Get today's mood
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMood = await MoodLog.findOne({
      userId,
      date: { $gte: today },
    })
      .sort({ date: -1 })
      .lean();
    const moodScore = todayMood?.score || "unknown";

    const ai = new GoogleGenAI({});

    const systemPrompt = `You are MindPath, a compassionate wellness companion for a ${role} dealing with ${stressor}. Their personal goal is: ${goal}. Their mood today is ${moodScore}/10. Be empathetic, keep responses under 150 words, and make advice career-context-aware. Never diagnose. Always recommend professional help for serious concerns.`;

    // Build conversation history as a single prompt
    const conversationHistory = messages
      .map((msg: { role: string; content: string }) => {
        const prefix = msg.role === "user" ? "User" : "Assistant";
        return `${prefix}: ${msg.content}`;
      })
      .join("\n");

    const lastMessage = messages[messages.length - 1].content;
    
    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt,
    });

    const reply = response.text;

    console.log(response)

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      fullError: error,
    });
    return NextResponse.json(
      {
        reply:
          "I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please call or text 988.",
      },
      { status: 200 }
    );
  }
}
