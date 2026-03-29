"use client";

import { useMemo, useState, useCallback } from "react";
import {
  TrendingUp,
  Tag,
  PenLine,
  Flame,
  Sparkles,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";

interface ReportData {
  stats: {
    avgMood: number;
    topTag: string;
    journalCount: number;
    streak: number;
  };
  chartData: { day: string; date: string; score: number }[];
  insight: string;
}

function buildWeekTabs(): { offset: number; label: string }[] {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const ws = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const we = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    return {
      offset: i,
      label: `${format(ws, "MMM d")} – ${format(we, "MMM d")}`,
    };
  });
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
  const weeks = useMemo(() => buildWeekTabs(), []);
  const [activeWeek, setActiveWeek] = useState(0);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: activeWeek }),
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(
          typeof err.error === "string" ? err.error : "Could not load report."
        );
        return;
      }
      const report = await res.json();
      setData(report);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [activeWeek]);

  const hasData =
    data && (data.chartData.length > 0 || data.stats.journalCount > 0);

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
            My Report
          </h1>
          <p className="text-muted">
            Pick a week, then generate your overview (calls the AI only when you
            ask).
          </p>
        </div>
        <button
          type="button"
          onClick={generateReport}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-accent text-white hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate report
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Week tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {weeks.map((w) => (
          <button
            key={w.offset}
            type="button"
            onClick={() => setActiveWeek(w.offset)}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 disabled:opacity-50 ${
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

      {!data && !loading && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface/40">
          <BarChart3 className="w-12 h-12 text-muted/40 mx-auto mb-4" />
          <h3 className="text-text font-semibold mb-2">No report loaded yet</h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            Choose the week above and click &quot;Generate report&quot; to load
            stats and your weekly insight.
          </p>
        </div>
      )}

      {loading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      )}

      {data && !hasData && !loading && (
        <div className="text-center py-20">
          <BarChart3 className="w-14 h-14 text-muted/30 mx-auto mb-4" />
          <h3 className="text-text font-semibold mb-2">No data for this week</h3>
          <p className="text-muted text-sm max-w-sm mx-auto">
            Log your mood or add a journal entry for this week, then generate
            again.
          </p>
        </div>
      )}

      {data && hasData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    data.stats.avgMood >= 6
                      ? "bg-accent-2/15 text-accent-2"
                      : "bg-accent-3/15 text-accent-3"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-text">
                {data.stats.avgMood || "—"}
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
                {data.stats.topTag}
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
                {data.stats.journalCount}
              </p>
              <p className="text-xs text-muted mt-1">Entries</p>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    data.stats.streak >= 3
                      ? "bg-orange-500/15 text-orange-400"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-text">
                {data.stats.streak}
                {data.stats.streak >= 3 && <span className="ml-1">🔥</span>}
              </p>
              <p className="text-xs text-muted mt-1">Day Streak</p>
            </div>
          </div>

          {data.chartData.length > 1 && (
            <div className="rounded-2xl bg-surface border border-border p-5 mb-8">
              <h3 className="text-text font-semibold mb-4">Mood This Week</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData}>
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

          {data.insight && (
            <div className="rounded-2xl bg-surface border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="text-text font-semibold">Weekly Insight</h3>
              </div>
              <p className="text-text/80 leading-relaxed">{data.insight}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
