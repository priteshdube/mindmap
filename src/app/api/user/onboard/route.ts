import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { name, email, role, stressor, goal } = body;

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        name,
        email,
        role,
        stressor,
        goal: goal || "",
        onboarded: true,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboard error:", error);
    return NextResponse.json(
      { error: "Failed to onboard user" },
      { status: 500 }
    );
  }
}
