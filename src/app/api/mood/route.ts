import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import MoodLog from "@/models/MoodLog";
import User from "@/models/User";
import { sendLowMoodEmail } from "@/lib/emails";

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
    });
  } catch (error) {
    console.error("POST mood error:", error);
    return NextResponse.json(
      { error: "Failed to save mood" },
      { status: 500 }
    );
  }
}
