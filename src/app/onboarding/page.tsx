"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const STRESSORS = [
  "Exam Pressure",
  "Job Searching",
  "Workplace Burnout",
  "Career Uncertainty",
  "Loneliness & Isolation",
  "Financial Pressure",
  "Family Expectations",
  "Something Else",
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"student" | "professional" | "">("");
  const [stressor, setStressor] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!role || !stressor) return;
    setLoading(true);

    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.fullName || user?.firstName || "User",
          email: user?.primaryEmailAddress?.emailAddress || "",
          role,
          stressor,
          goal,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-accent-2/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                style={{ width: step >= s ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-text mb-2">
              Welcome to MindPath{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-muted mb-10 text-lg">
              Which best describes you right now?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setRole("student")}
                className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                  role === "student"
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface hover:border-accent/40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    role === "student"
                      ? "bg-accent/20 text-accent"
                      : "bg-surface-2 text-muted group-hover:text-accent"
                  }`}
                >
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-1">Student</h3>
                <p className="text-sm text-muted">
                  Undergrad, grad student, or bootcamp learner
                </p>
              </button>

              <button
                onClick={() => setRole("professional")}
                className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                  role === "professional"
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface hover:border-accent/40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    role === "professional"
                      ? "bg-accent/20 text-accent"
                      : "bg-surface-2 text-muted group-hover:text-accent"
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-1">
                  Professional
                </h3>
                <p className="text-sm text-muted">
                  Working, job searching, or career transitioning
                </p>
              </button>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={() => role && setStep(2)}
                disabled={!role}
                className="bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-6 py-3 text-white font-medium transition-all duration-200 flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Stressor */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-text mb-2">
              What&apos;s weighing on you most?
            </h1>
            <p className="text-muted mb-10 text-lg">
              This helps us personalize your experience. Pick one.
            </p>

            <div className="flex flex-wrap gap-3">
              {STRESSORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStressor(s)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    stressor === s
                      ? "bg-accent text-white shadow-lg shadow-accent/20"
                      : "bg-surface border border-border text-muted hover:text-text hover:border-accent/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(1)}
                className="border border-border hover:border-accent/40 hover:bg-surface rounded-xl px-5 py-2.5 text-muted hover:text-text transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => stressor && setStep(3)}
                disabled={!stressor}
                className="bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-6 py-3 text-white font-medium transition-all duration-200 flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-text mb-2">
              What do you hope MindPath helps you with?
            </h1>
            <p className="text-muted mb-10 text-lg">
              Optional — but it helps us give better support.
            </p>

            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Managing burnout while preparing for interviews..."
              rows={4}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 text-text placeholder:text-muted resize-none transition-colors"
            />

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(2)}
                className="border border-border hover:border-accent/40 hover:bg-surface rounded-xl px-5 py-2.5 text-muted hover:text-text transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="bg-accent hover:bg-accent/80 disabled:opacity-60 rounded-xl px-6 py-3 text-white font-medium transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Let&apos;s Begin
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
