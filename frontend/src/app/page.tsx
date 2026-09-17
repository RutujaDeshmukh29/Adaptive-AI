"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Brain, Target, BookOpen } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AdaptEd AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="font-medium">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Intelligent Adaptive Learning Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Not a fixed study plan. <br />
          <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">
            A journey that adapts to you.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Ground your learning in your own course documents. AdaptEd AI tracks your mastery mathematically,
          tunes practice difficulty dynamically, and guides you with an adaptive tutor that understands your weak spots.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto px-8 text-base font-semibold">
              Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800">
              Sign In to Account
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 w-full text-left">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="rounded-lg bg-blue-500/10 p-3 w-fit text-blue-400">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Dynamic Mastery Model</h3>
            <p className="text-sm text-slate-400">
              Tracks performance using Exponential Moving Averages (EMA) across your curriculum.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="rounded-lg bg-green-500/10 p-3 w-fit text-green-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Document RAG Engine</h3>
            <p className="text-sm text-slate-400">
              Upload your syllabus or lecture PDFs. Quizzes and explanations cite exact page numbers.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="rounded-lg bg-purple-500/10 p-3 w-fit text-purple-400">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Adaptive Path & Quizzes</h3>
            <p className="text-sm text-slate-400">
              Prerequisite topics unlock when you prove mastery. Quizzes calibrate from easy to hard.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>AdaptEd AI — Personalized AI Learning Assistant • TECHFUSION Hackathon</p>
      </footer>
    </div>
  );
}
