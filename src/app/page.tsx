import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Brain,
  Smile,
  Sparkles,
  BarChart3,
  Users,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-text">MindPath</span>
          </Link>

          <div className="flex items-center gap-3">
            {userId ? (
              <Link
                href="/dashboard"
                className="bg-accent hover:bg-accent/80 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="border border-border hover:border-accent/40 hover:bg-surface rounded-xl px-5 py-2.5 text-muted hover:text-text text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-accent hover:bg-accent/80 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-2/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border mb-8">
            <div className="w-2 h-2 rounded-full bg-accent-2 animate-pulse" />
            <span className="text-xs font-medium text-muted">
              Built for students and professionals
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-text">A lighter way to care for</span>
            <br />
            <span className="bg-gradient-to-r from-accent via-accent to-accent-2 bg-clip-text text-transparent">
              your mental wellbeing
            </span>
            <br />
            <span className="text-text">every day.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            MindPath helps you check in, reflect, and find support that fits
            your real life, from exam pressure to career transitions.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard"
              className="bg-accent hover:bg-accent/80 rounded-xl px-8 py-3.5 text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/30"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="border border-border hover:border-accent/40 hover:bg-surface rounded-xl px-8 py-3.5 text-muted hover:text-text font-medium transition-colors flex items-center gap-2"
            >
              Learn More <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
                feel better
              </span>
            </h2>
            <p className="text-muted max-w-lg mx-auto">
              Thoughtful tools for emotional clarity, steadier routines, and
              practical support when days feel heavy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/30 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mb-5">
                <Smile className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-text font-semibold mb-2 group-hover:text-accent transition-colors">
                Mood Tracking
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Quick daily check-ins that help you spot patterns and understand
                your emotional rhythm.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/30 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-accent-2/15 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-accent-2" />
              </div>
              <h3 className="text-text font-semibold mb-2 group-hover:text-accent-2 transition-colors">
                AI Support
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                A compassionate AI companion that understands your career
                context and offers personalized guidance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/30 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-accent-3/15 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6 text-accent-3" />
              </div>
              <h3 className="text-text font-semibold mb-2 group-hover:text-accent-3 transition-colors">
                Weekly Reports
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                AI-powered weekly insights that help you understand your
                emotional trends and celebrate progress.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/30 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-text font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                Communities
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Curated communities matched to your specific situation — because
                you&apos;re not alone in this.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-text">MindPath</span>
          </div>
          <p className="text-xs text-muted">
            Built with care. Not a substitute for professional help.
          </p>
        </div>
      </footer>
    </div>
  );
}
