"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Play,
  Music,
  MessageCircle,
  Users,
  ExternalLink,
  AlertCircle,
  Quote,
} from "lucide-react";

interface SupportContent {
  quote: string;
  quoteAuthor: string;
  message: string;
  videos: { title: string; youtubeSearchQuery: string }[];
  songs: { title: string; artist: string; spotifySearchQuery: string }[];
}

const FALLBACK: SupportContent = {
  quote:
    "You don't have to control your thoughts. You just have to stop letting them control you.",
  quoteAuthor: "Dan Millman",
  message:
    "What you're feeling right now is valid, and it takes courage to acknowledge it.",
  videos: [
    {
      title: "5-Minute Breathing Exercise",
      youtubeSearchQuery: "5 minute breathing exercise for anxiety",
    },
    {
      title: "Grounding Technique",
      youtubeSearchQuery: "grounding technique 5 4 3 2 1 anxiety",
    },
    {
      title: "Self-Compassion Meditation",
      youtubeSearchQuery: "self compassion meditation 10 minutes",
    },
  ],
  songs: [
    {
      title: "Here Comes The Sun",
      artist: "The Beatles",
      spotifySearchQuery: "Here Comes The Sun Beatles",
    },
    {
      title: "Three Little Birds",
      artist: "Bob Marley",
      spotifySearchQuery: "Three Little Birds Bob Marley",
    },
    {
      title: "Lovely Day",
      artist: "Bill Withers",
      spotifySearchQuery: "Lovely Day Bill Withers",
    },
  ],
};

const advisors = [
  {
    name: "Dr. Sarah Chen",
    expertise: "Career Stress & Burnout",
    linkedin: "https://linkedin.com/in/",
  },
  {
    name: "Marcus Williams, LMHC",
    expertise: "Student Mental Health",
    linkedin: "https://linkedin.com/in/",
  },
  {
    name: "Dr. Priya Patel",
    expertise: "Workplace Anxiety",
    linkedin: "https://linkedin.com/in/",
  },
];

export default function SupportPage() {
  const [content, setContent] = useState<SupportContent | null>(null);
  const [moodTag, setMoodTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Get user's latest low mood
        const moodRes = await fetch("/api/mood");
        let tag = "low mood";
        let score = 3;

        if (moodRes.ok) {
          const moods = await moodRes.json();
          if (moods.length > 0) {
            tag = moods[0].tag || "low mood";
            score = moods[0].score || 3;
          }
        }
        setMoodTag(tag);

        // Get AI support content
        const res = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag, score }),
        });

        if (res.ok) {
          const data = await res.json();
          setContent(data);
        } else {
          setContent(FALLBACK);
        }
      } catch {
        setContent(FALLBACK);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const data = content || FALLBACK;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-3">
          We see you. You don&apos;t have to carry this alone. 💙
        </h1>
        {moodTag && (
          <span className="inline-block text-sm px-3 py-1 rounded-full bg-accent-3/15 text-accent-3 font-medium">
            {moodTag}
          </span>
        )}
      </div>

      {/* Quote */}
      {loading ? (
        <div className="skeleton h-32 rounded-2xl mb-8" />
      ) : (
        <div className="rounded-2xl bg-surface border border-border p-6 mb-8 border-l-4 border-l-accent">
          <Quote className="w-8 h-8 text-accent/40 mb-3" />
          <p className="text-lg text-text font-medium leading-relaxed mb-3">
            &ldquo;{data.quote}&rdquo;
          </p>
          <p className="text-sm text-muted">— {data.quoteAuthor}</p>
          {data.message && (
            <p className="text-text/80 mt-4 pt-4 border-t border-border leading-relaxed">
              {data.message}
            </p>
          )}
        </div>
      )}

      {/* Videos */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-accent" /> Watch Something Helpful
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.videos.map((v, i) => (
              <a
                key={i}
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  v.youtubeSearchQuery
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-surface border border-border p-4 hover:border-accent/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                      {v.title}
                    </p>
                    <p className="text-xs text-muted mt-1">YouTube</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted group-hover:text-accent transition-colors shrink-0" />
                </div>
                <div className="mt-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 font-medium">
                    Watch on YouTube
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Songs */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Music className="w-5 h-5 text-accent-2" /> Listen to Something
          Uplifting
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.songs.map((s, i) => (
              <a
                key={i}
                href={`https://open.spotify.com/search/${encodeURIComponent(
                  s.spotifySearchQuery
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-surface border border-border p-4 hover:border-accent-2/30 transition-all duration-200 group"
              >
                <p className="text-sm font-medium text-text group-hover:text-accent-2 transition-colors">
                  {s.title}
                </p>
                <p className="text-xs text-muted mt-0.5">{s.artist}</p>
                <div className="mt-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 font-medium">
                    Open in Spotify
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Support paths */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          href="/chat"
          className="rounded-2xl bg-surface border border-border p-5 hover:border-accent/30 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-text font-semibold mb-1 group-hover:text-accent transition-colors">
            Talk to AI Chatbot
          </h3>
          <p className="text-xs text-muted">
            Have a supportive conversation anytime.
          </p>
        </Link>

        <div className="rounded-2xl bg-surface border border-border p-5">
          <div className="w-10 h-10 rounded-xl bg-accent-2/15 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-accent-2" />
          </div>
          <h3 className="text-text font-semibold mb-3">Talk to an Advisor</h3>
          <div className="space-y-2.5">
            {advisors.map((adv, i) => (
              <a
                key={i}
                href={adv.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs group"
              >
                <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-muted" />
                </div>
                <div>
                  <p className="text-text group-hover:text-accent-2 transition-colors font-medium">
                    {adv.name}
                  </p>
                  <p className="text-muted text-[10px]">{adv.expertise}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <Link
          href="/community"
          className="rounded-2xl bg-surface border border-border p-5 hover:border-accent/30 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-text font-semibold mb-1 group-hover:text-accent transition-colors">
            Find Your People
          </h3>
          <p className="text-xs text-muted">
            Connect with communities who understand.
          </p>
        </Link>
      </div>

      {/* Crisis line */}
      <div className="rounded-2xl bg-surface border border-border p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-accent-2" />
          <p className="text-sm text-text font-medium">
            If you&apos;re in crisis, please call or text{" "}
            <span className="text-accent-2 font-bold">988</span>.
          </p>
        </div>
        <p className="text-xs text-muted">You matter. 💙</p>
      </div>
    </div>
  );
}
