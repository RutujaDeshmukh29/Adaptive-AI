"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib";
import { LearnerSnapshot, TopicMastery } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, ArrowRight, Check, RefreshCw, 
  BookOpen, FlaskConical, Target, TrendingUp, AlertCircle,
  FileText, Send, Flag, Play, Award, Brain, Clock, ChevronRight,
  BarChart2, HelpCircle, Flame, CheckCircle2, Lock, MessageSquare
} from "lucide-react";

interface PathItem {
  order: number;
  topic_id: number;
  topic: string;
  status: "done" | "current" | "in_progress" | "locked";
  mastery: number;
  reason: string;
}

interface PathResponse {
  goal: string;
  overall_progress: number;
  items: PathItem[];
}

interface MaterialItem {
  id: number;
  filename: string;
  status: string;
  chunk_count: number;
  uploaded_at: string;
}

interface ActivityItem {
  id: number;
  activity_type: string;
  topic_id?: number;
  topic_name?: string;
  description: string;
  result?: any;
  timestamp?: string;
  time_str: string;
  date_str: string;
}

interface QuizHistoryItem {
  id: number;
  score: number;
  difficulty: string;
  mastery_before: number;
  mastery_after: number;
  date: string;
}

interface ParentReportResponse {
  student?: any;
  today_stats?: {
    active_minutes_today: number;
    total_actions_today: number;
    quizzes_today: number;
    chat_queries_today: number;
    uploads_today: number;
  };
  mastery_map?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  recent_trend?: string;
  activities?: ActivityItem[];
  quiz_history?: QuizHistoryItem[];
  ai_advisor?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);
  const [pathData, setPathData] = useState<PathResponse | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [reportData, setReportData] = useState<ParentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [doubtText, setDoubtText] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [profileRes, pathRes, materialsRes, reportRes] = await Promise.allSettled([
          fetchApi<LearnerSnapshot>("/api/profile"),
          fetchApi<PathResponse>("/api/path"),
          fetchApi<{ materials: MaterialItem[]; total_chunks: number }>("/api/materials"),
          fetchApi<ParentReportResponse>("/api/parent/report"),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value) {
          setSnapshot(profileRes.value);
        }
        if (pathRes.status === "fulfilled" && pathRes.value) {
          setPathData(pathRes.value);
        }
        if (materialsRes.status === "fulfilled" && materialsRes.value?.materials) {
          setMaterials(materialsRes.value.materials);
        }
        if (reportRes.status === "fulfilled" && reportRes.value) {
          setReportData(reportRes.value);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleAskDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (doubtText.trim()) {
      router.push(`/assistant?q=${encodeURIComponent(doubtText.trim())}`);
    } else {
      router.push("/assistant");
    }
  };

  // User Profile & Progress Metrics
  const userName = snapshot?.user?.name || reportData?.student?.name || "Learner";
  const userSubject = snapshot?.subject || reportData?.student?.subject || "Curriculum";
  const userGoal = snapshot?.goal || pathData?.goal || "Mastery";
  const overallMastery = snapshot?.overall_mastery !== undefined
    ? Math.round(snapshot.overall_mastery)
    : (pathData?.overall_progress !== undefined ? Math.round(pathData.overall_progress) : 0);

  const totalQuizzes = snapshot?.total_quizzes || reportData?.quiz_history?.length || 0;
  const docsCount = materials.length;
  const totalChunks = materials.reduce((acc, m) => acc + (m.chunk_count || 0), 0);

  // Dynamic Adaptive Level: Level 1 (0-19%), Level 2 (20-39%), Level 3 (40-59%), Level 4 (60-79%), Level 5 (80-100%)
  const levelNum = Math.min(5, Math.max(1, Math.floor(overallMastery / 20) + 1));
  const levelLabel = snapshot?.experience_level 
    ? (snapshot.experience_level.charAt(0).toUpperCase() + snapshot.experience_level.slice(1)) 
    : "Adaptive";

  // Trend computation
  const recentTrend = snapshot?.recent_trend || reportData?.recent_trend || "stable";
  const trendBadge = recentTrend === "improving" ? "+4.2%" : recentTrend === "declining" ? "-2.5%" : "Stable";
  const trendColor = recentTrend === "improving" ? "text-emerald-600 dark:text-emerald-400" : recentTrend === "declining" ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400";

  // Current Topic
  const currentTopicName = snapshot?.current_topic?.name 
    || pathData?.items?.find(i => i.status === "current")?.topic 
    || pathData?.items?.[0]?.topic 
    || (snapshot?.mastery?.[0]?.topic)
    || `${userSubject} Fundamentals`;

  // Pipeline Statuses
  const isAssessDone = snapshot?.diagnostic_done || totalQuizzes > 0;
  const isProfileDone = Boolean(snapshot?.academic_level && snapshot?.goal);
  const isPersonalizeDone = Boolean(pathData?.items && pathData.items.length > 0);

  // Last Quiz
  const lastQuiz = reportData?.quiz_history && reportData.quiz_history.length > 0 
    ? reportData.quiz_history[0] 
    : null;

  // Real mastery list (from snapshot.mastery or fallback to pathData items)
  const masteryList: TopicMastery[] = snapshot?.mastery && snapshot.mastery.length > 0
    ? snapshot.mastery
    : (pathData?.items || []).map((p, idx) => ({
        topic_id: p.topic_id,
        topic: p.topic,
        mastery: p.mastery,
        band: p.mastery >= 70 ? "mastered" : p.mastery >= 40 ? "competent" : p.mastery > 0 ? "developing" : "struggling",
        attempts: p.status === "done" ? 2 : p.status === "current" ? 1 : 0,
      }));

  // Real activities
  const recentActivities = reportData?.activities || [];

  // Real quiz history
  const quizHistory = reportData?.quiz_history || [];

  // Upcoming Milestones from real Learning Path
  const upcomingMilestones = pathData?.items && pathData.items.length > 0
    ? pathData.items.slice(0, 3)
    : masteryList.slice(0, 3).map((m, idx) => ({
        order: idx + 1,
        topic_id: m.topic_id,
        topic: m.topic,
        status: m.mastery >= 70 ? "done" : idx === 0 ? "current" : "locked",
        mastery: m.mastery,
        reason: m.mastery >= 70 ? "Mastered!" : idx === 0 ? "Current focus area." : "Prerequisites required."
      } as PathItem));

  return (
    <div className="flex flex-col gap-8 max-w-[1520px] mx-auto w-full pb-16">
      
      {/* ── 1. Top Welcoming & Clean Minimalist Stats ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {userName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-900">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {snapshot?.streak_days || 1} Day Streak
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Adaptive trajectory for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userSubject}</span> • Target: <span className="text-slate-700 dark:text-slate-300 font-medium">{userGoal}</span>
          </p>
        </div>

        {/* 3 Clean Minimalist Metric Stats */}
        <div className="flex items-center gap-6 sm:gap-8 pt-2 lg:pt-0">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Mastery</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{overallMastery}%</span>
              <span className={`text-xs font-bold ${trendColor}`}>{trendBadge}</span>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adaptive Level</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">L{levelNum}</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{levelLabel}</span>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes Indexed</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{docsCount}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {totalChunks > 0 ? `${totalChunks} Chunks` : "Docs"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Streamlined Continuous Loop Minimalist Stepper ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-4 transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-base font-bold text-slate-900 dark:text-white">Continuous Adaptive Pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Live calibration active</span>
          </div>
        </div>

        {/* 6 Stage Continuous Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          
          {/* Stage 1: Assess */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
            isAssessDone 
              ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60" 
              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isAssessDone 
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" 
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              {isAssessDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "1"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">1. Assess</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {isAssessDone ? "Calibrated" : "Pending"}
              </span>
            </div>
          </div>

          {/* Stage 2: Profile */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
            isProfileDone 
              ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60" 
              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isProfileDone 
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" 
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              {isProfileDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "2"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">2. Profile</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {snapshot?.academic_level || "Active"}
              </span>
            </div>
          </div>

          {/* Stage 3: Personalize */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
            isPersonalizeDone 
              ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60" 
              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isPersonalizeDone 
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" 
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              {isPersonalizeDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "3"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">3. Personalize</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                Path Sequenced
              </span>
            </div>
          </div>

          {/* Stage 4: Learn (Currently Active) */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <div className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">4. Learn</span>
              <span className="text-[10px] text-indigo-100 truncate">Focus Topic</span>
            </div>
          </div>

          {/* Stage 5: Measure */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-800/60">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">5. Measure</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {totalQuizzes > 0 ? `${totalQuizzes} Quizzes` : "Pending Quiz"}
              </span>
            </div>
          </div>

          {/* Stage 6: Adapt */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-800/60">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
              6
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">6. Adapt</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                Dynamic Tracing
              </span>
            </div>
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
                Adaptive Recommendation
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Est. {snapshot?.study_time_minutes || 30} mins
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentTopicName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {snapshot?.weaknesses && snapshot.weaknesses.length > 0 ? (
                  <>Targeting detected gaps in <span className="font-semibold text-slate-700 dark:text-slate-300">{snapshot.weaknesses.join(", ")}</span> based on your recent quiz responses.</>
                ) : snapshot?.recent_mistake_tags && snapshot.recent_mistake_tags.length > 0 ? (
                  <>Reinforcing key concepts: <span className="font-semibold text-slate-700 dark:text-slate-300">{snapshot.recent_mistake_tags.slice(0, 3).join(", ")}</span>.</>
                ) : totalQuizzes === 0 ? (
                  <>Start your first adaptive practice session to calibrate topic mastery across {userSubject}.</>
                ) : (
                  <>Advancing through your calibrated learning path in {userSubject}.</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium py-2 border-y border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{snapshot?.study_time_minutes || 30} mins session</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Adaptive difficulty</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{userSubject}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Link 
                href="/practice"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/path"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all"
              >
                <span>View Learning Path</span>
              </Link>
            </div>
          </div>

          {/* Dynamic Learner Profile & Topic Mastery */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Learner Topic Mastery</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Continuous Bayesian knowledge estimation
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60">
                {userSubject}
              </span>
            </div>

            {/* Clean Progress Bars from User's Real Mastery */}
            <div className="flex flex-col gap-5 pt-1">
              {masteryList.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center flex flex-col items-center gap-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No topic mastery recorded yet for {userSubject}.
                  </p>
                  <Link href="/practice" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Take your first practice quiz →
                  </Link>
                </div>
              ) : (
                masteryList.slice(0, 6).map((item) => {
                  const score = Math.round(item.mastery || 0);
                  const isMastered = score >= 70;
                  const isStruggling = (item.attempts || 0) > 0 && score < 40;
                  const isDeveloping = (item.attempts || 0) > 0 && !isMastered && !isStruggling;
                  const notStarted = (item.attempts || 0) === 0;

                  return (
                    <div key={item.topic_id || item.topic} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[240px] sm:max-w-[340px]">
                            {item.topic}
                          </span>
                          {isMastered && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                              Mastered
                            </span>
                          )}
                          {isStruggling && (
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                              Needs Focus
                            </span>
                          )}
                          {isDeveloping && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900">
                              In Progress
                            </span>
                          )}
                          {notStarted && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              Unstarted
                            </span>
                          )}
                        </div>
                        <span className={`font-bold ${isStruggling ? "text-rose-600 dark:text-rose-400" : isMastered ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMastered ? "bg-emerald-500" : isStruggling ? "bg-rose-500" : isDeveloping ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          style={{ width: `${Math.max(score, notStarted ? 0 : 4)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {masteryList.length > 6 && (
              <div className="pt-1 flex justify-end">
                <Link href="/profile" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  View all {masteryList.length} topics in Profile →
                </Link>
              </div>
            )}
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
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {totalQuizzes > 0 ? `Session #${totalQuizzes}` : "Session #01"}
              </span>
            </div>

            {lastQuiz ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">Last Assessment</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(lastQuiz.score)}% Score
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Difficulty: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{lastQuiz.difficulty}</span> • {lastQuiz.date}
                </p>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs pt-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mastery adjusted: {Math.round(lastQuiz.mastery_before)}% → {Math.round(lastQuiz.mastery_after)}%</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">No Assessments Yet</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to test your knowledge on {currentTopicName}. Questions automatically adjust to your skill.
                </p>
              </div>
            )}

            <Link
              href="/practice"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>{totalQuizzes > 0 ? "Continue Adaptive Practice" : "Start First Practice Quiz"}</span>
            </Link>
          </div>

          {/* Clean AI Study Assistant Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col gap-5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Study Assistant</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Gemini RAG Online</span>
            </div>

            <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {snapshot?.weaknesses && snapshot.weaknesses.length > 0 ? (
                    <>Working on <span className="font-semibold text-indigo-600 dark:text-indigo-400">{snapshot.weaknesses[0]}</span>? Ask me for an intuitive analogy or a step-by-step code demonstration.</>
                  ) : (
                    <>Need help understanding <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentTopicName}</span>? Ask any conceptual question or paste your code snippet.</>
                  )}
                </p>
              </div>
            </div>

            {/* Interactive Query Input */}
            <form onSubmit={handleAskDoubt} className="relative flex items-center">
              <input
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder={`Ask a doubt about ${currentTopicName}...`}
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
              Live audit trail of your adaptive practice sessions and AI interactions.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 px-3 py-1.5 rounded-full w-fit">
            {recentActivities.length > 0 ? `Synced (${recentActivities.length} activities)` : "Ready for Activity"}
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              No learning activities logged yet. Take a quiz or chat with the AI assistant to track your progress and trigger Bayesian mastery updates.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/practice" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition">
                Start Practice
              </Link>
              <Link href="/assistant" className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                Ask Assistant
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentActivities.slice(0, 4).map((act) => {
              const isQuiz = act.activity_type === "quiz";
              const isChat = act.activity_type === "chat";
              const isUpload = act.activity_type === "upload";

              return (
                <div key={act.id} className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isQuiz ? "bg-indigo-600" : isChat ? "bg-purple-500" : isUpload ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[240px]">
                        {act.topic_name || act.activity_type.toUpperCase()}
                      </span>
                    </div>
                    {act.result?.score !== undefined && (
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {Math.round(act.result.score)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-800">
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                      {act.activity_type.replace("_", " ")}
                    </span>
                    <span>{act.date_str} at {act.time_str}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              View All ({quizHistory.length})
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {quizHistory.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center flex flex-col items-center gap-2">
                <Target className="w-6 h-6 text-slate-400" />
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  No diagnostic assessments completed yet. Launch a quiz to record your calibration milestones.
                </p>
              </div>
            ) : (
              quizHistory.slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        Adaptive Assessment #{q.id}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Difficulty: <span className="capitalize font-medium">{q.difficulty}</span> • {q.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round(q.score)}%
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {Math.round(q.mastery_after) >= Math.round(q.mastery_before) ? "+" : ""}
                      {Math.round(q.mastery_after - q.mastery_before)}% Mastery
                    </span>
                  </div>
                </div>
              ))
            )}
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
              {materials.length} Documents Active
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {materials.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center flex flex-col items-center gap-2">
                <FileText className="w-6 h-6 text-slate-400" />
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  No study materials uploaded yet. Upload PDF notes or textbooks to enable grounded RAG questions.
                </p>
                <Link href="/materials" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1">
                  Upload your first document →
                </Link>
              </div>
            ) : (
              materials.slice(0, 3).map((mat) => (
                <div key={mat.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {mat.filename}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {mat.chunk_count || 0} Chunks • Vectorized with Gemini RAG
                      </span>
                    </div>
                  </div>
                  <Link 
                    href={`/assistant?m=${mat.id}`}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                  >
                    Query
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Upload notes, slides, or assignments</span>
            <Link href="/materials" className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              <span>Manage Materials</span>
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
              Personalized sequence aligned to your target goal: <span className="font-semibold text-slate-700 dark:text-slate-300">{userGoal}</span>.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Daily Pace: {snapshot?.study_time_minutes || 45} mins</span>
            </div>
            <span>•</span>
            <Link href="/path" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              <span>View Full Learning Path</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingMilestones.map((item, idx) => {
            const isDone = item.status === "done";
            const isCurrent = item.status === "current";
            const score = Math.round(item.mastery || 0);

            return (
              <div key={item.topic_id || item.topic} className={`p-5 rounded-xl border flex flex-col gap-3 transition-colors ${
                isCurrent 
                  ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs" 
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isDone 
                      ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900" 
                      : isCurrent 
                        ? "bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" 
                        : "bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {isDone ? "Mastered" : isCurrent ? "Current Focus" : `Milestone #${item.order || idx + 1}`}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {score}% Mastery
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {item.topic}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.reason || `Sequenced module in your ${userSubject} trajectory.`}
                </p>
                <div className="pt-2 mt-auto">
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isDone ? "bg-emerald-500" : isCurrent ? "bg-indigo-600" : "bg-slate-400 dark:bg-slate-600"}`} 
                      style={{ width: `${Math.max(score, isCurrent ? 10 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
