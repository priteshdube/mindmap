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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mood", label: "Mood Check-in", icon: Smile },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/chat", label: "AI Chat", icon: MessageCircle },
  { href: "/community", label: "Community", icon: Users },
  { href: "/report", label: "My Report", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-40">
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-lg shadow-accent/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-text tracking-tight">
              MindPath
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "border-l-2 border-accent bg-accent/10 text-text ml-0"
                        : "text-muted hover:text-text hover:bg-surface-2 border-l-2 border-transparent"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">
                {user?.firstName || "User"}
              </p>
              <p className="text-xs text-muted truncate">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 px-2 py-1 safe-area-bottom">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs transition-all duration-200 ${
                    isActive
                      ? "text-accent"
                      : "text-muted hover:text-text"
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
