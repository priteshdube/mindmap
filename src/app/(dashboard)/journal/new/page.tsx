"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("@/components/TipTapEditor"), {
  ssr: false,
  loading: () => <div className="skeleton h-[400px] rounded-xl" />,
});

interface AiInsight {
  tone: string;
  summary: string;
  suggestion: string;
}

export default function JournalNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState<AiInsight | null>(null);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, moodScore }),
      });

      if (res.ok) {
        const data = await res.json();
        setInsight(data.entry.aiSummary);
        setAnalyzing(false);

        // Show insight for 3 seconds then redirect
        setTimeout(() => {
          router.push(`/journal/${data.entry._id}`);
        }, 3000);
      }
    } catch {
      router.push("/journal");
    } finally {
      setSaving(false);
    }
  };

  // Show analyzing state
  if (analyzing && saving) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">
            Reviewing your entry...
          </h2>
          <p className="text-muted">
            Gathering a short reflection based on what you wrote.
          </p>
        </div>
      </div>
    );
  }

  // Show insight card
  if (insight && !saving) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-up">
          <div className="rounded-2xl bg-surface border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-text">Reflection Insight</h3>
            </div>

            <div className="mb-4">
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-accent/15 text-accent font-medium">
                {insight.tone}
              </span>
            </div>

            <p className="text-text/90 mb-4 leading-relaxed">
              {insight.summary}
            </p>

            <div className="p-4 rounded-xl bg-surface-2 border border-border">
              <p className="text-sm text-accent-2">Suggested next step: {insight.suggestion}</p>
            </div>

            <p className="text-xs text-muted mt-4 text-center">
              Redirecting to your entry...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
          <Link
            href="/journal"
            className="flex items-center gap-2 text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || saving}
            className="bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-5 py-2 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save & Analyze
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind today? ...."
          className="w-full bg-transparent border-none text-2xl md:text-3xl font-bold text-text placeholder:text-muted/40 focus:outline-none mb-6"
        />

        {/* Mood score pills */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted mr-1">Mood:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() =>
                setMoodScore(moodScore === n ? undefined : n)
              }
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${moodScore === n
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-muted hover:text-text hover:bg-surface border border-border"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* TipTap editor */}
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your thoughts..."
        />
      </div>
    </div>
  );
}
