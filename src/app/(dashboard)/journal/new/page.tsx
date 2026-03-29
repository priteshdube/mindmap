"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import TipTapEditor from "@/components/TipTapEditor";

export default function JournalNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, moodScore }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/journal/${data.entry._id}`);
        return;
      }
    } catch {
      router.push("/journal");
      return;
    }

    setSubmitting(false);
  };

  if (submitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">
            Saving your entry...
          </h2>
          <p className="text-muted">
            You&apos;ll see your reflection on the next screen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/journal"
            className="flex items-center gap-2 text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || submitting}
            className="bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-5 py-2 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save & Analyze
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in pb-20">
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
