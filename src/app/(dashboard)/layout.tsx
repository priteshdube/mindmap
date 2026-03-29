"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main
        className={`transition-all duration-300 min-h-screen pb-20 md:pb-0 ${expanded ? "md:ml-64" : "md:ml-16"
          }`}
      >
        {children}
      </main>
    </div>
  );
}