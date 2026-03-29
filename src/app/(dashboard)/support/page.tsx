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
  Headphones,
  Volume2,
} from "lucide-react";

interface SupportContent {
  quote: string;
  quoteAuthor: string;
  message: string;
  uplifting_songs: { title: string; artist: string; spotifyQuery: string }[];
  motivational_videos: { title: string; youtubeSearchQuery: string }[];
  meditation_videos: { title: string; youtubeSearchQuery: string }[];
  binaural_beats: { title: string; type: string; youtubeSearchQuery: string }[];
}

const FALLBACK: SupportContent = {
  quote:
    "You don't have to control your thoughts. You just have to stop letting them control you.",
  quoteAuthor: "Dan Millman",
  message:
    "What you're feeling right now is valid, and it takes courage to acknowledge it.",
  uplifting_songs: [
    {
      title: "Here Comes The Sun",
      artist: "The Beatles",
      spotifyQuery: "Here Comes The Sun Beatles",
    },
    {
      title: "Three Little Birds",
      artist: "Bob Marley",
      spotifyQuery: "Three Little Birds Bob Marley",
    },
    {
      title: "Lovely Day",
      artist: "Bill Withers",
      spotifyQuery: "Lovely Day Bill Withers",
    },
  ],
  motivational_videos: [
    {
      title: "How to Overcome Self-Doubt",
      youtubeSearchQuery: "motivational speaker overcome self doubt",
    },
    {
      title: "Change Your Mindset",
      youtubeSearchQuery: "powerful motivational speech change mindset",
    },
  ],
  meditation_videos: [
    {
      title: "5-Minute Breathing Exercise",
      youtubeSearchQuery: "5 minute breathing exercise anxiety relief",
    },
    {
      title: "Guided Meditation",
      youtubeSearchQuery: "10 minute guided meditation relaxation",
    },
  ],
  binaural_beats: [
    {
      title: "Relaxation & Calm",
      type: "10Hz Alpha Waves",
      youtubeSearchQuery: "10Hz alpha waves relaxation meditation",
    },
    {
      title: "Focus & Clarity",
      type: "40Hz Beta Waves",
      youtubeSearchQuery: "40Hz beta waves focus concentration",
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

// Helper to get YouTube embed URL from search query
function getYoutubeEmbedUrl(searchQuery: string): string {
  // This returns a search result, for users to click and watch
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    searchQuery
  )}`;
}

// Helper to get Spotify embedded player or link
function getSpotifyLink(query: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

export default function SupportPage() {
  const [content, setContent] = useState<SupportContent | null>(null);
  const [moodTag, setMoodTag] = useState("");
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-surface-2">
      <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
            We see you. You don&apos;t have to carry this alone. 💙
          </h1>
          <p className="text-muted mb-4">
            Here are personalized resources to support your wellbeing.
          </p>
          {moodTag && (
            <span className="inline-block text-sm px-4 py-2 rounded-full bg-accent-3/15 text-accent-3 font-medium">
              {moodTag}
            </span>
          )}
        </div>

        {/* Quote */}
        {loading ? (
          <div className="skeleton h-40 rounded-2xl mb-8" />
        ) : (
          <div className="rounded-2xl bg-surface border border-border p-8 mb-12 border-l-4 border-l-accent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -mr-10 -mt-10" />
            <Quote className="w-8 h-8 text-accent/40 mb-4" />
            <p className="text-xl text-text font-medium leading-relaxed mb-4">
              &ldquo;{data.quote}&rdquo;
            </p>
            <p className="text-sm text-muted mb-4">— {data.quoteAuthor}</p>
            {data.message && (
              <p className="text-text/85 pt-4 border-t border-border leading-relaxed">
                {data.message}
              </p>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Uplifting Songs */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
              <Music className="w-5 h-5 text-accent-2" />
              🎵 Uplifting Songs
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data.uplifting_songs.map((song, i) => (
                  <a
                    key={i}
                    href={getSpotifyLink(song.spotifyQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-3 hover:border-green-500/40 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text group-hover:text-green-400 transition-colors">
                          {song.title}
                        </p>
                        <p className="text-xs text-muted mt-1">{song.artist}</p>
                      </div>
                      <Music className="w-4 h-4 text-green-500 shrink-0 ml-2" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                        Open in Spotify
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Middle Column - Meditation & Binaural */}
          <div className="lg:col-span-1 space-y-8">
            {/* Meditation Videos */}
            <div>
              <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-400" />
                🧘 Meditation
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton h-24 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {data.meditation_videos.map((video, i) => (
                    <a
                      key={i}
                      href={getYoutubeEmbedUrl(video.youtubeSearchQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-3 hover:border-purple-500/40 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text group-hover:text-purple-400 transition-colors">
                            {video.title}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-purple-500 shrink-0" />
                      </div>
                      <div className="mt-2.5">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                          Watch on YouTube
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Binaural Beats */}
            <div>
              <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-400" />
                🧠 Binaural Beats
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton h-24 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {data.binaural_beats.map((beat, i) => (
                    <a
                      key={i}
                      href={getYoutubeEmbedUrl(beat.youtubeSearchQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-3 hover:border-blue-500/40 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text group-hover:text-blue-400 transition-colors">
                            {beat.title}
                          </p>
                          <p className="text-xs text-muted mt-1">{beat.type}</p>
                        </div>
                        <Volume2 className="w-4 h-4 text-blue-500 shrink-0" />
                      </div>
                      <div className="mt-2.5">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                          Listen on YouTube
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Motivational Videos */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
              <Play className="w-5 h-5 text-red-400" />
              🎬 Motivational Talks
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton h-32 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data.motivational_videos.map((video, i) => (
                  <a
                    key={i}
                    href={getYoutubeEmbedUrl(video.youtubeSearchQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-4 hover:border-red-500/40 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-semibold text-text group-hover:text-red-400 transition-colors flex-1">
                        {video.title}
                      </p>
                      <Play className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 font-medium inline-block">
                      Watch on YouTube
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support Paths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 mt-12">
          <Link
            href="/chat"
            className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/50 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mb-4 group-hover:bg-accent/25 transition-colors">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-text font-semibold mb-2 group-hover:text-accent transition-colors">
              AI Chatbot
            </h3>
            <p className="text-xs text-muted">
              Have a supportive conversation anytime.
            </p>
          </Link>

          <div className="rounded-2xl bg-surface border border-border p-6">
            <div className="w-12 h-12 rounded-xl bg-accent-2/15 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-accent-2" />
            </div>
            <h3 className="text-text font-semibold mb-3">Mental Health Advisors</h3>
            <div className="space-y-2">
              {advisors.map((adv, i) => (
                <a
                  key={i}
                  href={adv.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs group hover:text-accent-2 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="font-medium">{adv.name}</p>
                    <p className="text-muted text-[10px]">{adv.expertise}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <Link
            href="/community"
            className="rounded-2xl bg-surface border border-border p-6 hover:border-purple-500/50 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center mb-4 group-hover:bg-purple-500/25 transition-colors">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-text font-semibold mb-2 group-hover:text-purple-400 transition-colors">
              Community
            </h3>
            <p className="text-xs text-muted">
              Connect with people who understand your journey.
            </p>
          </Link>
        </div>

        {/* Crisis Line */}
        <div className="rounded-2xl bg-gradient-to-r from-accent-3/10 to-accent-3/5 border border-accent-3/30 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-accent-3" />
            <p className="text-sm text-text font-semibold">
              In Crisis?{" "}
              <span className="text-accent-3 font-bold text-base">Call 988</span>
            </p>
          </div>
          <p className="text-xs text-muted">
            Free, confidential support 24/7. You matter. 💙
          </p>
        </div>
      </div>
    </div>
  );
}
