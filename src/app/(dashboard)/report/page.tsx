"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Tag,
  PenLine,
  Flame,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ReportData {
  stats: {
    avgMood: number;
    topTag: string;
    journalCount: number;
    streak: number;
  };
  chartData: { day: string; date: string; score: number }[];
  insight: string;
  weeks: { offset: number; label: string }[];
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

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);
  const [weeks, setWeeks] = useState<{ offset: number; label: string }[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/report?week=${activeWeek}`);
        if (res.ok) {
          const report = await res.json();
          setData(report);
          if (report.weeks) setWeeks(report.weeks);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeWeek]);

  if (loading && !data) {
    return (
      <div className="p-6 md:p-8 animate-fade-in">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-10 w-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl mb-8" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  const hasData =
    data && (data.chartData.length > 0 || data.stats.journalCount > 0);

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
          My Report
        </h1>
        <p className="text-muted">Your weekly wellness overview.</p>
      </div>

      {/* Week tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {weeks.map((w) => (
          <button
            key={w.offset}
            onClick={() => setActiveWeek(w.offset)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeWeek === w.offset
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-white hover:border-accent/40"
            }`}
          >
            {w.label}
            {w.offset === 0 && (
              <span className="ml-1.5 text-xs opacity-60">(this week)</span>
            )}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="text-center py-20">
          <BarChart3 className="w-14 h-14 text-muted/30 mx-auto mb-4" />
          <h3 className="text-text font-semibold mb-2">No data for this week</h3>
          <p className="text-muted text-sm max-w-sm mx-auto">
            Start logging your mood daily to unlock insights.
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    data!.stats.avgMood >= 6
                      ? "bg-accent-2/15 text-accent-2"
                      : "bg-accent-3/15 text-accent-3"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-text">
                {data!.stats.avgMood || "—"}
                <span className="text-sm font-normal text-muted">/10</span>
              </p>
              <p className="text-xs text-muted mt-1">Avg Mood</p>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm font-bold text-text truncate">
                {data!.stats.topTag}
              </p>
              <p className="text-xs text-muted mt-1">Top Feeling</p>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-2/15 flex items-center justify-center text-accent-2">
                  <PenLine className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-text">
                {data!.stats.journalCount}
              </p>
              <p className="text-xs text-muted mt-1">Entries</p>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    data!.stats.streak >= 3
                      ? "bg-orange-500/15 text-orange-400"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-text">
                {data!.stats.streak}
                {data!.stats.streak >= 3 && <span className="ml-1">🔥</span>}
              </p>
              <p className="text-xs text-muted mt-1">Day Streak</p>
            </div>
          </div>

          {/* Chart */}
          {data!.chartData.length > 1 && (
            <div className="rounded-2xl bg-surface border border-border p-5 mb-8">
              <h3 className="text-text font-semibold mb-4">Mood This Week</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data!.chartData}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b6b80", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b6b80", fontSize: 12 }}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#7c6ff7"
                      strokeWidth={2.5}
                      dot={{ fill: "#7c6ff7", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "#7c6ff7" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI Insight */}
          {data!.insight && (
            <div className="rounded-2xl bg-surface border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="text-text font-semibold">Weekly Insight</h3>
              </div>
              <p className="text-text/80 leading-relaxed">
                {data!.insight}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
