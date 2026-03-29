"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Smile,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Flame,
  PenLine,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, isToday } from "date-fns";

interface MoodLog {
  _id: string;
  score: number;
  tag: string;
  note: string;
  date: string;
}

interface JournalEntry {
  _id: string;
  title: string;
  date: string;
  aiSummary?: { tone: string; summary: string; suggestion: string };
}

interface DashStats {
  avg: number;
  journalCount: number;
  streak: number;
}

function moodLabel(score: number): string {
  if (score <= 2) return "Struggling";
  if (score <= 4) return "Low";
  if (score <= 6) return "Steady";
  if (score <= 8) return "Good";
  return "Excellent";
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function computeStats(moods: MoodLog[]): DashStats {
  if (!moods.length) return { avg: 0, journalCount: 0, streak: 0 };
  const avg = moods.reduce((a, m) => a + m.score, 0) / moods.length;

  // Compute streak
  const sorted = [...moods].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dayStr = format(checkDate, "yyyy-MM-dd");
    const hasLog = sorted.some(
      (m) => format(new Date(m.date), "yyyy-MM-dd") === dayStr
    );
    if (hasLog) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return { avg: Math.round(avg * 10) / 10, journalCount: 0, streak };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold text-accent">
          {payload[0].value}/10
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [userProfile, setUserProfile] = useState<{
    stressor: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [moodRes, journalRes, profileRes] = await Promise.all([
          fetch("/api/mood"),
          fetch("/api/journal?limit=3"),
          fetch("/api/user/profile"),
        ]);

        if (moodRes.ok) setMoods(await moodRes.json());
        if (journalRes.ok) {
          const data = await journalRes.json();
          setJournals(Array.isArray(data) ? data : []);
        }
        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.user) setUserProfile(pData.user);
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todayMood = moods.find((m) => isToday(new Date(m.date)));
  const stats = computeStats(moods);
  stats.journalCount = journals.length;

  const chartData = [...moods]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      day: format(new Date(m.date), "EEE"),
      score: m.score,
    }));

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-fade-in">
        <div className="skeleton h-10 w-72 mb-2" />
        <div className="skeleton h-5 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl mt-6" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          {getGreeting()}, {user?.firstName || "there"}
        </h1>
        <p className="text-muted mt-1">
          Here&apos;s your check-in overview
          {userProfile?.stressor
            ? ` — navigating ${userProfile.stressor.toLowerCase()} one day at a time.`
            : "."}
        </p>
      </div>

      {/* Mood CTA or today's mood */}
      {!todayMood ? (
        <Link href="/mood">
          <div className="rounded-2xl bg-surface border border-accent/30 p-6 hover:border-accent/60 transition-all duration-200 cursor-pointer group shadow-lg shadow-accent/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Smile className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-text font-semibold">
                    How are you feeling today?
                  </h3>
                  <p className="text-muted text-sm">
                    Take 30 seconds to check in with yourself
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl bg-surface border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent font-bold flex items-center justify-center">
              {todayMood.score}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-text font-semibold">
                  {todayMood.score}/10
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                  {todayMood.tag || moodLabel(todayMood.score)}
                </span>
              </div>
              {todayMood.note && (
                <p className="text-sm text-muted mt-1 line-clamp-1">
                  {todayMood.note}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-surface border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                stats.avg >= 6
                  ? "bg-accent-2/15 text-accent-2"
                  : "bg-accent-3/15 text-accent-3"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-muted text-sm">7-Day Average</span>
          </div>
          <p className="text-2xl font-bold text-text">
            {stats.avg > 0 ? stats.avg : "—"}
            <span className="text-sm font-normal text-muted">/10</span>
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
              <PenLine className="w-4 h-4" />
            </div>
            <span className="text-muted text-sm">Journal Entries</span>
          </div>
          <p className="text-2xl font-bold text-text">{stats.journalCount}</p>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                stats.streak >= 3
                  ? "bg-orange-500/15 text-orange-400"
                  : "bg-accent-2/15 text-accent-2"
              }`}
            >
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-muted text-sm">Day Streak</span>
          </div>
          <p className="text-2xl font-bold text-text">{stats.streak}</p>
        </div>
      </div>

      {/* Mood chart */}
      {chartData.length > 1 && (
        <div className="rounded-2xl bg-surface border border-border p-5">
          <h3 className="text-text font-semibold mb-4">7-Day Mood</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6f7d79", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6f7d79", fontSize: 12 }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2f9b87"
                  strokeWidth={2.5}
                  dot={{ fill: "#2f9b87", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#2f9b87" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent journal entries */}
      <div className="rounded-2xl bg-surface border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text font-semibold">Recent Journal Entries</h3>
          <Link
            href="/journal"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        {journals.length > 0 ? (
          <div className="space-y-2">
            {journals.map((entry) => (
              <Link
                key={entry._id}
                href={`/journal/${entry._id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-2 transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text truncate">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </p>
                </div>
                {entry.aiSummary?.tone && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium ml-3">
                    {entry.aiSummary.tone}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-muted text-sm mb-3">No journal entries yet</p>
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 rounded-xl px-4 py-2 text-sm text-white font-medium transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" /> Write First Entry
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/mood"
          className="flex items-center gap-3 rounded-2xl bg-surface border border-border p-4 hover:border-accent/40 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
            <Smile className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-text">Log Mood</span>
        </Link>

        <Link
          href="/journal/new"
          className="flex items-center gap-3 rounded-2xl bg-surface border border-border p-4 hover:border-accent/40 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-2/15 flex items-center justify-center text-accent-2">
            <PenLine className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-text">
            New Journal Entry
          </span>
        </Link>

        <Link
          href="/chat"
          className="flex items-center gap-3 rounded-2xl bg-surface border border-border p-4 hover:border-accent/40 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-3/15 flex items-center justify-center text-accent-3">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-text">Talk to AI</span>
        </Link>
      </div>
    </div>
  );
}
