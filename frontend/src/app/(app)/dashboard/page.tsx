"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib";
import { LearnerSnapshot } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, ArrowRight, Check, RefreshCw, Schedule,
  BookOpen, FlaskConical, Target, TrendingUp, AlertCircle,
  FileText, Send, Flag, Play, Award, Brain, Clock, ChevronRight,
  BarChart2, HelpCircle
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [doubtText, setDoubtText] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi<LearnerSnapshot>("/api/profile");
        setSnapshot(data);
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAskDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (doubtText.trim()) {
      router.push(`/assistant?q=${encodeURIComponent(doubtText.trim())}`);
    } else {
      router.push("/assistant");
    }
  };

  const userName = snapshot?.user?.name || "Aarav";
  const overallMastery = snapshot?.overall_mastery ? Math.round(snapshot.overall_mastery) : 78;
  const docsCount = snapshot?.materials_count !== undefined ? snapshot.materials_count : 14;
  const currentTopicName = snapshot?.current_topic?.name || "Attention Mechanisms & Multi-Head Self-Attention";

  return (
    <div className="flex flex-col gap-8 max-w-[1520px] mx-auto w-full pb-16">
      
      {/* ── 1. Top Welcoming & Clean Minimalist Stats ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {userName}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Your personal adaptive study trajectory is calibrated and ready for today.
          </p>
        </div>

        {/* 3 Clean Minimalist Metric Stats */}
        <div className="flex items-center gap-6 sm:gap-8 pt-2 lg:pt-0">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Mastery</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{overallMastery}%</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+4.2%</span>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adaptive Level</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">3.2</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Dynamic</span>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes Indexed</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{docsCount}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Docs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Streamlined Continuous Loop Minimalist Stepper ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-4 transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
            <span className="text-base font-bold text-slate-900 dark:text-white">Adaptive Pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loop active</span>
          </div>
        </div>

        {/* Clean Horizontal Stage Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">1. Assess</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">2. Profile</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">3. Personalize</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <div className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <span className="text-xs font-bold truncate">4. Learn</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-800/60 opacity-75">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">5. Measure</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-800/60 opacity-75">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
              6
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">6. Adapt</span>
          </div>
        </div>
      </div>

      {/* ── 3. Main 2-Column Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (~60% width) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Hero Recommended Action Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6 transition-colors">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended Action
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Estimated: 18 mins</span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentTopicName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Targeting your identified gap in dimensional projection matrices before advancing to transformer decoders.
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium py-2 border-y border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>18 mins</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>3 concepts</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>1 simulation</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Link 
                href="/practice"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/path"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all"
              >
                <span>Review Prerequisites</span>
              </Link>
            </div>
          </div>

          {/* Dynamic Learner Profile & Topic Mastery */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Learner Topic Mastery</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Continuous real-time skill estimation</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60">
                {snapshot?.subject || "Deep Learning"}
              </span>
            </div>

            {/* Clean Progress Bars */}
            <div className="flex flex-col gap-5 pt-1">
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Neural Networks & Backprop</span>
                  <span className="text-slate-900 dark:text-white font-bold">92%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">Attention & Transformers</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                      Needs Focus
                    </span>
                  </div>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">54%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "54%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Optimization & Loss Functions</span>
                  <span className="text-slate-900 dark:text-white font-bold">88%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "88%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Vector Embeddings & ChromaDB</span>
                  <span className="text-slate-900 dark:text-white font-bold">81%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "81%" }}></div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (~40% width) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Adaptive Practice Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adaptive Practice</h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Test #04</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">Last Assessment</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">4 / 5 (80%)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Transformers & RAG Ingestion Pipeline</p>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs pt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Difficulty adjusted: 2.8 → 3.2</span>
              </div>
            </div>

            <Link
              href="/practice"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Start Practice (5 Qs)</span>
            </Link>
          </div>

          {/* Clean AI Study Assistant Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Study Assistant</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
            </div>

            <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  In scaled dot-product attention, dividing by √d<sub>k</sub> stabilizes gradients for larger projection dimensions.
                </p>
              </div>
            </div>

            {/* Interactive Query Input */}
            <form onSubmit={handleAskDoubt} className="relative flex items-center">
              <input
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="Ask a doubt about this module..."
                type="text"
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
              />
              <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <button 
                type="submit"
                className="absolute right-2 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Send doubt to AI Assistant"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* ── 4. Recent Learning Activity & Detailed Knowledge Breakdown ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Learning Activity & Knowledge Breakdown
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Granular evaluation of conceptual mastery across calibrated learning trajectories.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 px-3 py-1.5 rounded-full w-fit">
            Last synced: Today, 10:42 AM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Scaled Dot-Product & Multi-Head Attention</span>
              </div>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">82%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: "82%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +6.5% this week
              </span>
              <span>Reviewed 42 mins ago</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Positional Encodings & RoPE</span>
              </div>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">58%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: "58%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Needs calibration
              </span>
              <span>Reviewed yesterday</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Feed-Forward Networks & GELU Activations</span>
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">91%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: "91%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +3.1% this week
              </span>
              <span>Reviewed 2 days ago</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Residual Connections & LayerNorm</span>
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">76%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: "76%" }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +5.0% this week
              </span>
              <span>Reviewed 3 days ago</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── 5. 2-Column Split: Diagnostic History + Indexed Sources ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sub-column: Adaptive Diagnostic & Practice History */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adaptive Diagnostic History</h3>
            </div>
            <Link href="/practice" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All (12)
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Transformers & RAG Pipeline</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">5 Questions • Dynamic Difficulty</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">4 / 5 (80%)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+0.4 Caliber</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Vector Embeddings & ChromaDB</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">5 Questions • Indexing focus</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">5 / 5 (100%)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+0.6 Caliber</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-semibold shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Backpropagation & Gradients</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">8 Questions • Foundations</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">7 / 8 (88%)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+0.2 Caliber</span>
              </div>
            </div>

          </div>

          <Link 
            href="/practice"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch New Adaptive Diagnostic</span>
          </Link>
        </div>

        {/* Right Sub-column: Indexed Academic Sources & Coursework */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Indexed Academic Sources</h3>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60">
              {docsCount} Documents Active
            </span>
          </div>

          <div className="flex flex-col gap-3">
            
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                    CS224N Stanford Lecture 04: Transformers
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    48 Chunks • Vectorized with Gemini RAG
                  </span>
                </div>
              </div>
              <Link 
                href="/assistant"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                Query
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                    Attention Is All You Need (Vaswani et al.)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    32 Chunks • Semantic graph verified
                  </span>
                </div>
              </div>
              <Link 
                href="/assistant"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                Query
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                    Deep Learning Specialization: Quiz 3 Problem Sets
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    19 Chunks • Multi-modal diagrams parsed
                  </span>
                </div>
              </div>
              <Link 
                href="/assistant"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                Query
              </Link>
            </div>

          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Looking for another textbook or lecture?</span>
            <Link href="/materials" className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              <span>Add New Source</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ── 6. Upcoming Milestones & Weekly Adaptive Study Plan ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Milestones & Study Plan</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Synthesized pace aligned to your mastery target of 90% by end of Month.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Pace: 4.5 hrs/week</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Target Completion: Nov 28</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3 relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900">
                Stage 4 - Active
              </span>
              <span className="text-xs text-slate-400">Est. 2 hrs</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Multi-Head Attention Decoders</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Autoregressive masking, cross-attention projections, and KV caching optimization.
            </p>
            <div className="pt-2 mt-auto">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                Upcoming
              </span>
              <span className="text-xs text-slate-400">Est. 3 hrs</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">FlashAttention & Hardware Acceleration</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              GPU SRAM tiling, kernel fusion, and memory-bandwidth bound computation.
            </p>
            <div className="pt-2 mt-auto">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                Upcoming
              </span>
              <span className="text-xs text-slate-400">Est. 2.5 hrs</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">RAG Ingestion & Re-ranking</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cross-encoder rerankers, reciprocal rank fusion (RRF), and context window packing.
            </p>
            <div className="pt-2 mt-auto">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
