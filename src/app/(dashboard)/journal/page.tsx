"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, PenLine } from "lucide-react";
import { format } from "date-fns";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  date: string;
  moodScore?: number;
  aiSummary?: { tone: string; summary: string; suggestion: string };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

const toneColors: Record<string, string> = {
  hopeful: "bg-accent-2/15 text-accent-2",
  anxious: "bg-accent-3/15 text-accent-3",
  reflective: "bg-accent/15 text-accent",
  grateful: "bg-accent-2/15 text-accent-2",
  stressed: "bg-accent-3/15 text-accent-3",
  motivated: "bg-accent-2/15 text-accent-2",
  sad: "bg-accent-3/15 text-accent-3",
  calm: "bg-accent/15 text-accent",
  frustrated: "bg-orange-500/15 text-orange-400",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/journal");
        if (res.ok) setEntries(await res.json());
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 animate-fade-in">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Your Journal
          </h1>
          <p className="text-muted mt-1">
            A safe space for your thoughts and reflections.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="bg-accent hover:bg-accent/80 rounded-xl px-5 py-2.5 text-white font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Entry
        </Link>
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Link
              key={entry._id}
              href={`/journal/${entry._id}`}
              className="rounded-2xl bg-surface border border-border p-5 hover:border-accent/30 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-text font-semibold group-hover:text-accent transition-colors line-clamp-1">
                  {entry.title}
                </h3>
                {entry.aiSummary?.tone && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                      toneColors[entry.aiSummary.tone.toLowerCase()] ||
                      "bg-accent/15 text-accent"
                    }`}
                  >
                    {entry.aiSummary.tone}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted line-clamp-3 mb-3">
                {stripHtml(entry.content).substring(0, 120)}
                {stripHtml(entry.content).length > 120 ? "..." : ""}
              </p>
              <p className="text-xs text-muted/60">
                {format(new Date(entry.date), "MMMM d, yyyy")}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-14 h-14 text-muted/30 mx-auto mb-4" />
          <h3 className="text-text font-semibold mb-2">
            Your journal is empty
          </h3>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            Writing helps you process your thoughts and feelings. Start your
            first entry today.
          </p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 rounded-xl px-5 py-2.5 text-white font-medium transition-colors"
          >
            <PenLine className="w-4 h-4" /> Write First Entry
          </Link>
        </div>
      )}
    </div>
  );
}
