"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Trash2,
  X,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  date: string;
  moodScore?: number;
  aiSummary?: { tone: string; summary: string; suggestion: string };
}

export default function JournalViewPage() {
  const router = useRouter();
  const params = useParams();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/journal/${params.id}`);
        if (res.ok) {
          setEntry(await res.json());
        } else {
          router.push("/journal");
        }
      } catch {
        router.push("/journal");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/journal/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/journal");
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="skeleton h-6 w-32 mb-8" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!entry) return null;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/journal"
          className="flex items-center gap-2 text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Journal</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="border border-border hover:border-accent-3/40 hover:bg-accent-3/5 text-muted hover:text-accent-3 rounded-xl px-4 py-2 text-sm transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Title and metadata */}
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-3">
        {entry.title}
      </h1>
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(entry.date), "MMMM d, yyyy · h:mm a")}
        </div>
        {entry.moodScore && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
            Mood: {entry.moodScore}/10
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className="prose prose-slate max-w-none mb-8 text-text/90 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />

      {/* AI Insight */}
      {entry.aiSummary && (
        <div className="rounded-2xl bg-surface border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-text font-semibold">AI Insight</h3>
          </div>
          <div className="mb-3">
            <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
              {entry.aiSummary.tone}
            </span>
          </div>
          <p className="text-text/80 mb-4 leading-relaxed">
            {entry.aiSummary.summary}
          </p>
          <div className="p-3 rounded-xl bg-surface-2 border border-border">
            <p className="text-sm text-accent-2">
              Suggested next step: {entry.aiSummary.suggestion}
            </p>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text font-semibold">Delete Entry</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-muted hover:text-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-muted text-sm mb-6">
              Are you sure you want to delete &quot;{entry.title}&quot;? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-border hover:border-accent/40 hover:bg-surface-2 rounded-xl py-2.5 text-muted hover:text-text text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-accent-3 hover:bg-accent-3/80 rounded-xl py-2.5 text-white text-sm font-medium transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
