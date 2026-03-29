// Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Smile,
  BookOpen,
  MessageCircle,
  Users,
  BarChart3,
  Brain,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mood", label: "Mood Check-in", icon: Smile },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/chat", label: "AI Chat", icon: MessageCircle },
  { href: "/community", label: "Community", icon: Users },
  { href: "/report", label: "My Report", icon: BarChart3 },
];

export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 bottom-0 z-40 bg-surface border-r border-border flex-col transition-all duration-300
    ${expanded ? "w-64" : "w-16"}`}
      >
        {/* Logo + hamburger */}
        <div className="p-3 pb-4 flex items-center justify-between">
          {expanded && (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-lg shadow-accent/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-text tracking-tight">
                MindPath
              </span>
            </Link>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors ${!expanded ? "mx-auto" : ""
              }`}
          >
            {expanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-accent/15 text-text shadow-sm"
                        : "text-muted hover:text-text hover:bg-surface-2"
                      } ${!expanded ? "justify-center" : ""}`}
                    title={!expanded ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {expanded && item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div
            className={`flex items-center gap-3 ${!expanded ? "justify-center" : ""
              }`}
          >
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            {expanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {user?.firstName || "User"}
                </p>
                <p className="text-xs text-muted truncate">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 px-2 py-1 safe-area-bottom">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs transition-all duration-200 ${isActive ? "text-accent" : "text-muted hover:text-text"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}