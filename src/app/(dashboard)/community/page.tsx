"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Star } from "lucide-react";

interface Community {
  name: string;
  url: string;
  members: string;
  platform: "reddit" | "facebook";
  description?: string;
  recommended?: boolean;
}

interface CommunityCategory {
  title: string;
  communities: Community[];
}

const stressorToRecommended: Record<string, string[]> = {
  "Exam Pressure": ["r/college", "r/GradSchool"],
  "Job Searching": ["r/cscareerquestions", "r/jobs"],
  "Workplace Burnout": ["r/burnout", "r/mentalhealth"],
  "Loneliness & Isolation": ["r/loneliness", "Mental Health Support"],
  "Financial Pressure": ["r/StudentLoans", "r/jobs"],
  "Family Expectations": ["r/mentalhealth", "Mental Health Support"],
  "Career Uncertainty": ["r/cscareerquestions", "r/careerguidance"],
  "Something Else": ["r/mentalhealth", "r/anxiety"],
};

const categories: CommunityCategory[] = [
  {
    title: "Career & Growth",
    communities: [
      {
        name: "r/cscareerquestions",
        url: "https://reddit.com/r/cscareerquestions",
        members: "1.2M+",
        platform: "reddit",
        description: "Computer science career questions and advice",
      },
      {
        name: "r/careerguidance",
        url: "https://reddit.com/r/careerguidance",
        members: "850K+",
        platform: "reddit",
        description: "Career guidance and professional development",
      },
      {
        name: "r/jobs",
        url: "https://reddit.com/r/jobs",
        members: "750K+",
        platform: "reddit",
        description: "Job hunting tips, resume help, and work advice",
      },
      {
        name: "Job Search Support",
        url: "https://facebook.com/groups/jobsearchsupport",
        members: "180K+",
        platform: "facebook",
        description: "Mutual support for job seekers",
      },
    ],
  },
  {
    title: "Mental Wellness",
    communities: [
      {
        name: "r/burnout",
        url: "https://reddit.com/r/burnout",
        members: "200K+",
        platform: "reddit",
        description: "Recovering from burnout together",
      },
      {
        name: "r/anxiety",
        url: "https://reddit.com/r/anxiety",
        members: "950K+",
        platform: "reddit",
        description: "A safe space for anxiety support",
      },
      {
        name: "r/loneliness",
        url: "https://reddit.com/r/loneliness",
        members: "350K+",
        platform: "reddit",
        description: "Battling loneliness and isolation",
      },
      {
        name: "r/mentalhealth",
        url: "https://reddit.com/r/mentalhealth",
        members: "1M+",
        platform: "reddit",
        description: "General mental health discussion and support",
      },
      {
        name: "Mental Health Support",
        url: "https://facebook.com/groups/mentalhealthsupportgroup",
        members: "120K+",
        platform: "facebook",
        description: "Peer support for mental health challenges",
      },
    ],
  },
  {
    title: "Student Life",
    communities: [
      {
        name: "r/college",
        url: "https://reddit.com/r/college",
        members: "900K+",
        platform: "reddit",
        description: "College life discussions and advice",
      },
      {
        name: "r/GradSchool",
        url: "https://reddit.com/r/GradSchool",
        members: "450K+",
        platform: "reddit",
        description: "Graduate student support and resources",
      },
      {
        name: "r/StudentLoans",
        url: "https://reddit.com/r/StudentLoans",
        members: "300K+",
        platform: "reddit",
        description: "Navigate student loan management",
      },
      {
        name: "Student Mental Health",
        url: "https://facebook.com/groups/studentmentalhealth",
        members: "95K+",
        platform: "facebook",
        description: "Mental health support for students",
      },
    ],
  },
];

export default function CommunityPage() {
  const [, setStressor] = useState("");
  const [recommended, setRecommended] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.stressor) {
            setStressor(data.user.stressor);
            setRecommended(
              stressorToRecommended[data.user.stressor] || []
            );
          }
        }
      } catch {
        // silently fail
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
          Find your people.
        </h1>
        <p className="text-muted">
          Communities that understand what you&apos;re going through.
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => (
          <div key={cat.title}>
            <h2 className="text-lg font-semibold text-text mb-4">
              {cat.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.communities.map((c) => {
                const isRec = recommended.includes(c.name);
                return (
                  <div
                    key={c.name}
                    className={`rounded-2xl bg-surface border p-5 transition-all duration-200 ${
                      isRec
                        ? "border-accent/30 shadow-lg shadow-accent/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-text font-semibold">{c.name}</h3>
                        {isRec && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Recommended
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          c.platform === "reddit"
                            ? "bg-orange-500/15 text-orange-400"
                            : "bg-blue-500/15 text-blue-400"
                        }`}
                      >
                        {c.platform === "reddit" ? "Reddit" : "Facebook"}
                      </span>
                    </div>

                    {c.description && (
                      <p className="text-sm text-muted mb-3">
                        {c.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">
                        {c.members} members
                      </span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent hover:bg-accent/80 rounded-xl px-4 py-1.5 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        Join Community{" "}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
