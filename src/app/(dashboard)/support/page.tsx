"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Music2,
  VolumeX,
  MessageCircle,
  Users,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Play,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────────── types ─────────────────────────────── */
interface SupportContent {
  quote: string;
  quoteAuthor: string;
  message: string;
  videos: { title: string; youtubeSearchQuery: string }[];
  songs: { title: string; artist: string; spotifySearchQuery: string }[];
}

/* ─────────────────────────────── fallback ───────────────────────────── */
const FALLBACK: SupportContent = {
  quote:
    "You don't have to control your thoughts. You just have to stop letting them control you.",
  quoteAuthor: "Dan Millman",
  message:
    "What you're feeling is real. Small, steady steps can make today easier.",
  videos: [
    {
      title: "5-Minute Breathing Exercise",
      youtubeSearchQuery: "5 minute breathing exercise for anxiety",
    },
    {
      title: "Grounding Technique 5-4-3-2-1",
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

/* ─────────────── YouTube thumbnail helper ───────────────────────────── */
// We use a known relaxing video ID per slot as placeholder thumbnails.
// In production you'd resolve these via YouTube Data API.
const THUMB_IDS = ["inpok4MKVLM", "O-6f5wQXSu8", "ZToicYcHIOU"];

function YouTubeCard({
  video,
  index,
}: {
  video: { title: string; youtubeSearchQuery: string };
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const thumbId = THUMB_IDS[index % THUMB_IDS.length];
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    video.youtubeSearchQuery
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group block rounded-2xl overflow-hidden bg-surface border border-border hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-surface-2">
        <img
          src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-110" : "scale-100"
            }`}
        />
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-red-500 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* YouTube badge */}
        <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold tracking-wide">
          YouTube
        </span>
      </div>
      {/* Title */}
      <div className="p-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-text group-hover:text-accent transition-colors leading-snug line-clamp-2">
          {video.title}
        </p>
        <ExternalLink className="w-3.5 h-3.5 text-muted shrink-0" />
      </div>
    </a>
  );
}

/* ─────────────── Advisors ───────────────────────────────────────────── */
const advisors = [
  {
    name: "Dr. Sarah Chen",
    expertise: "Career Stress & Burnout",
    linkedin: "https://linkedin.com/in/",
    initials: "SC",
  },
  {
    name: "Marcus Williams, LMHC",
    expertise: "Student Mental Health",
    linkedin: "https://linkedin.com/in/",
    initials: "MW",
  },
  {
    name: "Dr. Priya Patel",
    expertise: "Workplace Anxiety",
    linkedin: "https://linkedin.com/in/",
    initials: "PP",
  },
];

/* ─────────────── normalize (unchanged logic) ────────────────────────── */
function normalizeSupportContent(input: unknown): SupportContent {
  const raw = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;

  const videos = Array.isArray(raw.videos)
    ? (raw.videos as unknown[])
      .map((v) => {
        if (!v || typeof v !== "object") return null;
        const item = v as Record<string, unknown>;
        if (
          typeof item.title === "string" &&
          typeof item.youtubeSearchQuery === "string"
        )
          return { title: item.title, youtubeSearchQuery: item.youtubeSearchQuery };
        return null;
      })
      .filter(Boolean)
      .slice(0, 3) as { title: string; youtubeSearchQuery: string }[]
    : [];

  const songs = Array.isArray(raw.songs)
    ? (raw.songs as unknown[])
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const item = s as Record<string, unknown>;
        if (
          typeof item.title === "string" &&
          typeof item.artist === "string" &&
          typeof item.spotifySearchQuery === "string"
        )
          return {
            title: item.title,
            artist: item.artist,
            spotifySearchQuery: item.spotifySearchQuery,
          };
        return null;
      })
      .filter(Boolean)
      .slice(0, 3) as { title: string; artist: string; spotifySearchQuery: string }[]
    : [];

  return {
    quote:
      typeof raw.quote === "string" && raw.quote.trim()
        ? raw.quote
        : FALLBACK.quote,
    quoteAuthor:
      typeof raw.quoteAuthor === "string" && raw.quoteAuthor.trim()
        ? raw.quoteAuthor
        : FALLBACK.quoteAuthor,
    message:
      typeof raw.message === "string" && raw.message.trim()
        ? raw.message
        : FALLBACK.message,
    videos: videos.length ? videos : FALLBACK.videos,
    songs: songs.length ? songs : FALLBACK.songs,
  };
}

/* ─────────────────────────────── Page ──────────────────────────────── */
export default function SupportPage() {
  const [content, setContent] = useState<SupportContent | null>(null);
  const [moodTag, setMoodTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ambient music — free orchestral loop from Pixabay CDN */
  useEffect(() => {
    const audio = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=relaxing-145038.mp3"
    );
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => { });
    }
    setMusicOn((p) => !p);
  };

  /* data fetch */
  useEffect(() => {
    async function load() {
      try {
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

        const res = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag, score }),
        });
        setContent(res.ok ? normalizeSupportContent(await res.json()) : FALLBACK);
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
    <div className="relative p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">

      {/* ── Music toggle (top-right) ─────────────────────────────────── */}
      <button
        onClick={toggleMusic}
        title={musicOn ? "Pause ambient music" : "Play ambient music"}
        className={`fixed top-5 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border
          ${musicOn
            ? "bg-accent text-white border-accent shadow-accent/30 scale-110"
            : "bg-surface text-muted border-border hover:border-accent/40 hover:text-accent"
          }`}
      >
        {musicOn ? (
          <Music2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-muted uppercase tracking-widest">
            Your Support Space
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4 leading-tight">
          You don&apos;t have to carry{" "}
          <span className="text-accent">this alone.</span>
        </h1>
        {moodTag && (
          <span className="inline-block text-sm px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium border border-accent/20">
            Feeling: {moodTag}
          </span>
        )}
      </div>

      {/* ── Quote card ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="skeleton h-40 rounded-3xl mb-10" />
      ) : (
        <div className="relative rounded-3xl overflow-hidden mb-10 border border-border">
          {/* gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-surface to-accent-2/8 pointer-events-none" />
          <div className="relative p-8">
            <span className="text-6xl leading-none text-accent/20 font-serif select-none absolute top-4 left-7">
              &ldquo;
            </span>
            <p className="text-xl md:text-2xl text-text font-semibold leading-relaxed mt-4 mb-4">
              {data.quote}
            </p>
            <p className="text-sm text-accent font-medium">— {data.quoteAuthor}</p>
            {data.message && (
              <p className="text-text/70 mt-5 pt-5 border-t border-border/60 leading-relaxed text-sm md:text-base">
                {data.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Videos ──────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
            <Play className="w-4 h-4 text-red-400" fill="currentColor" />
          </div>
          <h2 className="text-lg font-bold text-text">Watch Something Helpful</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.videos.map((v, i) => (
              <YouTubeCard key={i} video={v} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Songs ───────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-text">Listen to Something Uplifting</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
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
                className="group rounded-2xl bg-surface border border-border p-5 hover:border-green-500/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 flex items-center gap-4"
              >
                {/* disc icon */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border border-green-500/20">
                  <Music2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text group-hover:text-green-400 transition-colors truncate">
                    {s.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{s.artist}</p>
                  <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-semibold">
                    Open in Spotify
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── Support paths ───────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-text mb-5">
          You Have Support Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* AI Chat */}
          <Link
            href="/chat"
            className="group rounded-3xl bg-surface border border-border p-6 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 flex flex-col"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-text font-bold mb-2 group-hover:text-accent transition-colors">
              Talk to AI
            </h3>
            <p className="text-xs text-muted leading-relaxed flex-1">
              A supportive, non-judgmental conversation available any time of day.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Start chatting <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Advisors */}
          <div className="rounded-3xl bg-surface border border-border p-6 flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-accent-2/15 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-accent-2" />
            </div>
            <h3 className="text-text font-bold mb-4">Talk to an Advisor</h3>
            <div className="space-y-3 flex-1">
              {advisors.map((adv, i) => (
                <a
                  key={i}
                  href={adv.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent-2/20 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 border border-accent/20">
                    {adv.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text group-hover:text-accent-2 transition-colors truncate">
                      {adv.name}
                    </p>
                    <p className="text-[10px] text-muted">{adv.expertise}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted shrink-0 ml-auto" />
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <Link
            href="/community"
            className="group rounded-3xl bg-surface border border-border p-6 hover:border-accent-3/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-accent-3/10 flex flex-col"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent-3/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-accent-3" />
            </div>
            <h3 className="text-text font-bold mb-2 group-hover:text-accent-3 transition-colors">
              Find Your People
            </h3>
            <p className="text-xs text-muted leading-relaxed flex-1">
              Connect with communities who truly understand what you&apos;re going through.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-accent-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── Crisis banner ────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-surface border border-accent-2/20 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent-2/15 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-accent-2" />
        </div>
        <div>
          <p className="text-sm text-text font-semibold">
            If you&apos;re in crisis, please call or text{" "}
            <span className="text-accent-2 font-bold text-base">988</span>
          </p>
          <p className="text-xs text-muted mt-0.5">
            The Suicide & Crisis Lifeline is free, confidential, and available 24/7.
            You matter.
          </p>
        </div>
      </div>

    </div>
  );
}