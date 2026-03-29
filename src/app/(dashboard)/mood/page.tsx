"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const MOOD_STATES = [
  "Very Low",
  "Very Low",
  "Low",
  "Low",
  "Steady",
  "Steady",
  "Good",
  "Good",
  "Great",
  "Excellent",
];
const LABELS: Record<string, [number, number]> = {
  Struggling: [1, 2],
  Low: [3, 4],
  Okay: [5, 6],
  Good: [7, 8],
  Excellent: [9, 10],
};

const TAGS = [
  "Career Pressure",
  "Burnout",
  "Loneliness",
  "Anxiety",
  "Overwhelmed",
  "Good Day",
  "Motivated",
  "Financially Stressed",
  "Family Pressure",
];

function getLabel(score: number): string {
  for (const [label, [lo, hi]] of Object.entries(LABELS)) {
    if (score >= lo && score <= hi) return label;
  }
  return "Okay";
}

type SubmissionResult = {
  title: string;
  message: string;
  insight: string;
  nextPath: string;
  ctaLabel: string;
};

export default function MoodPage() {
  const router = useRouter();
  const [score, setScore] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (selectedTags.length === 0) return;
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          tag: selectedTags.join(", "),
          note,
        }),
      });

      if (!res.ok) {
        const errorPayload = await res
          .json()
          .catch(() => ({ error: "Failed to save mood" }));
        throw new Error(errorPayload.error || "Failed to save mood");
      }

      const data = await res.json();
      const isLowMood = score <= 4 || data.redirect === "/support";

      if (isLowMood) {
        setResult({
          title: "Thanks for checking in",
          message:
            "You are not alone. We have gathered some support resources that can help right now.",
          insight:
            data.insight ||
            "You took an honest first step today; one small kind action for yourself is enough right now.",
          nextPath: "/support",
          ctaLabel: "View Support Resources",
        });
      } else {
        setResult({
          title: "Great job checking in",
          message:
            "Your mood has been logged. Keep this momentum going and check your dashboard insights.",
          insight:
            data.insight ||
            "You are building a healthy check-in habit, and that consistency will help you keep your momentum.",
          nextPath: "/dashboard",
          ctaLabel: "Go to Dashboard",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save mood";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-xl animate-fade-in rounded-2xl border border-border bg-surface p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-3">{result.title}</h1>
          <p className="text-muted mb-8">{result.message}</p>
          <p className="rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text mb-8">
            {result.insight}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(result.nextPath)}
              className="flex-1 bg-accent hover:bg-accent/80 rounded-xl py-3.5 text-white font-semibold transition-all duration-200"
            >
              {result.ctaLabel}
            </button>
            <button
              onClick={() => {
                setResult(null);
                setSelectedTags([]);
                setNote("");
                setScore(5);
              }}
              className="flex-1 bg-surface-2 border border-border hover:border-accent/40 rounded-xl py-3.5 text-text font-semibold transition-all duration-200"
            >
              Log Another Mood
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-text mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
            How are you feeling right now?
          </h1>
          <p className="text-muted">A short check-in can help you notice patterns over time.</p>
        </div>

        {/* Mood state */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center rounded-full bg-accent/15 px-6 py-2.5 text-accent font-semibold tracking-wide">
            {MOOD_STATES[score - 1]}
          </div>
        </div>

        {/* Slider */}
        <div className="mb-2 px-4">
          <input
            type="range"
            min={1}
            max={10}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Score and label */}
        <div className="flex items-center justify-between px-4 mb-10">
          <span className="text-muted text-sm">1</span>
          <div className="text-center">
            <span className="text-2xl font-bold text-accent">{score}</span>
            <span className="text-muted text-sm">/10</span>
            <p
              className={`text-sm font-medium mt-1 ${score <= 4
                  ? "text-accent-3"
                  : score <= 6
                    ? "text-muted"
                    : "text-accent-2"
                }`}
            >
              {getLabel(score)}
            </p>
          </div>
          <span className="text-muted text-sm">10</span>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <p className="text-text font-medium mb-3">
            What best describes your mood?
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedTags.includes(tag)
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "bg-surface border border-border text-muted hover:text-text hover:border-accent/40"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text font-medium">
              Anything else? <span className="text-muted font-normal">(optional)</span>
            </p>
            <span className="text-xs text-muted">{note.length}/280</span>
          </div>
          <textarea
            value={note}
            onChange={(e) =>
              e.target.value.length <= 280 && setNote(e.target.value)
            }
            placeholder="A few words about how you're feeling..."
            rows={3}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 text-text placeholder:text-muted resize-none transition-colors"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={selectedTags.length === 0 || saving}
          className="w-full bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-3.5 text-white font-semibold transition-all duration-200"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            "Log My Mood"
          )}
        </button>
        {error && <p className="mt-3 text-sm text-accent-3">{error}</p>}
      </div>
    </div>
  );
}
