"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const EMOJIS = ["😔", "😔", "😟", "😟", "😐", "😐", "🙂", "🙂", "😊", "🌟"];
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

export default function MoodPage() {
  const router = useRouter();
  const [score, setScore] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (selectedTags.length === 0) return;
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

      const data = await res.json();
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
            How are you feeling?
          </h1>
          <p className="text-muted">Be honest — this is your safe space.</p>
        </div>

        {/* Emoji */}
        <div className="text-center mb-6">
          <span className="text-7xl md:text-8xl inline-block transition-all duration-300">
            {EMOJIS[score - 1]}
          </span>
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
                    : "bg-surface border border-border text-muted hover:text-white hover:border-accent/40"
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
      </div>
    </div>
  );
}
