"use client";

import { useState, useEffect } from "react";
import { 
  Users, Clock, Trophy, Target, BookOpen, AlertCircle, 
  CheckCircle2, Sparkles, Printer, UserPlus, Flame, 
  MessageSquare, FileText, ChevronRight, RefreshCw, Loader2,
  HelpCircle, ShieldCheck, HeartHandshake, TrendingUp, Calendar,
  Download, Share2, Radio, Send, Bell, ChevronDown, Check, Copy,
  ExternalLink, Lightbulb, Zap, Activity, MessageCircle, BarChart3,
  GraduationCap, KeyRound, ThumbsUp, Heart, X, Brain
} from "lucide-react";
import { fetchApi } from "@/lib";
import { ParentReport, ParentStudentSummary, MeResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

export default function ParentDashboardPage() {
  const [report, setReport] = useState<ParentReport | null>(null);
  const [students, setStudents] = useState<ParentStudentSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Encouragement state
  const [encouragementSent, setEncouragementSent] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Modals
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [advisorSubmitted, setAdvisorSubmitted] = useState(false);
  const [advisorDate, setAdvisorDate] = useState("");
  const [advisorTopic, setAdvisorTopic] = useState("Weekly Academic Progress & Caliber Review");
  const [smsDigestEnabled, setSmsDigestEnabled] = useState(true);
  const [smsToast, setSmsToast] = useState<string | null>(null);

  // Link child state
  const [linkCodeInput, setLinkCodeInput] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const loadDashboardData = async (studentId?: number) => {
    try {
      setError(null);
      
      // Fetch me
      const me = await fetchApi<MeResponse>("/api/auth/me").catch(() => null);
      setCurrentUser(me);

      // Load linked students list
      const studentsData = await fetchApi<{ students: ParentStudentSummary[] }>("/api/parent/students").catch(() => ({ students: [] }));
      setStudents(studentsData.students || []);

      const targetId = studentId || (studentsData.students?.[0]?.id ?? null);
      setSelectedStudentId(targetId);

      // Load report
      const queryParam = targetId ? `?student_id=${targetId}` : "";
      const reportData = await fetchApi<ParentReport>(`/api/parent/report${queryParam}`);
      setReport(reportData);
    } catch (err: any) {
      setError(err.detail || "Unable to load student progress report. Please verify student account connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStudentSwitch = (studentId: number) => {
    setSelectedStudentId(studentId);
    setRefreshing(true);
    loadDashboardData(studentId);
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    try {
      const res = await fetchApi<{ sync_key: string }>("/api/parent/generate-sync-key", { method: "POST" });
      if (res.sync_key && report) {
        setReport({
          ...report,
          student: {
            ...report.student,
            link_code: res.sync_key
          }
        });
        if (currentUser) {
          setCurrentUser({ ...currentUser, link_code: res.sync_key });
        }
      }
    } catch (err: any) {
      console.error("Failed to regenerate sync key:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2200);
  };

  const handleCopyAll = (name: string, key: string) => {
    const text = `AdaptEd AI Parent Login Details:\nStudent Name: ${name}\nParent Sync Key: ${key}\nSign in at: ${window.location.origin}/login (Select 'Parent Login' tab)`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleSendEncouragement = () => {
    setEncouragementSent(true);
    setTimeout(() => setEncouragementSent(false), 3500);
  };

  const handleToggleSms = () => {
    const next = !smsDigestEnabled;
    setSmsDigestEnabled(next);
    setSmsToast(next ? "Weekly SMS & WhatsApp digests enabled (Sundays at 7:00 PM IST)" : "Weekly SMS & WhatsApp digests paused");
    setTimeout(() => setSmsToast(null), 3000);
  };

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCodeInput.trim()) return;

    setLinking(true);
    setLinkError(null);
    setLinkSuccess(null);

    try {
      const res = await fetchApi<{ status: string; student_name: string; student_id: number }>("/api/parent/link", {
        method: "POST",
        body: JSON.stringify({ code: linkCodeInput.trim() }),
      });

      setLinkSuccess(`Connected to ${res.student_name}'s learning profile!`);
      setLinkCodeInput("");
      setShowLinkModal(false);
      await loadDashboardData(res.student_id);
    } catch (err: any) {
      setLinkError(err.detail || "Could not find a student matching that Parent Sync Key.");
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Syncing telemetry with student learning workspace...
        </p>
        <p className="text-xs text-slate-500">Retrieving real-time Bayesian mastery & study consistency</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Parent Portal</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {error || "No student learning profile is currently connected to this account."}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button onClick={() => loadDashboardData()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => setShowLinkModal(true)} className="rounded-xl">
            <KeyRound className="w-4 h-4 mr-2" />
            Link with Sync Key
          </Button>
        </div>
      </div>
    );
  }

  const isStudentViewer = currentUser?.role === "student";
  const student = report.student;
  const liveStudy = report.live_study;
  const courses = report.courses_mastery || [];
  const pace = report.curriculum_pace;
  const accuracy = report.practice_accuracy;
  const aiAssist = report.ai_assistance;
  const insights = report.adaptive_insights;
  const consistency = report.weekly_consistency;
  const milestones = report.diagnostic_milestones || [];
  const timeline = report.timeline || [];

  return (
    <div className="space-y-6 pb-16 print:p-0 print:space-y-4 transition-colors">
      
      {/* ── TOAST ALERT FOR SMS / WHATSAPP PREFERENCES ── */}
      {smsToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{smsToast}</span>
        </div>
      )}

      {/* ── ENCOURAGEMENT SENT FLOATING NOTIFICATION ── */}
      {encouragementSent && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center gap-3 text-sm font-semibold animate-bounce">
          <ThumbsUp className="w-5 h-5 text-amber-300" />
          <span>Encouragement badge beamed to {student.name}&apos;s active screen! 👍</span>
        </div>
      )}

      {/* ── 1. STUDENT SYNC KEY CARD (VISIBLE TO STUDENTS IN THEIR PORTAL) ── */}
      {isStudentViewer && (
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-lg border border-indigo-500/30 print:hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span>Parent Portal Family Sync Enabled</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Your Unique Student Sync Key for Parents
              </h2>
              <p className="text-indigo-100/90 text-xs sm:text-sm leading-relaxed">
                Share your Student Name and Sync Key below with your parents. They can open the <strong>Parent Login</strong> tab at <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-200">/login</code> to securely view your mastery progress, study timeline, and weekly AI summaries without requiring your password.
              </p>
            </div>

            {/* Sync Key Details & Action Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">Student Username</span>
                <span className="text-sm font-bold text-white">{student.name}</span>
              </div>

              <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">Parent Sync Key</span>
                <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider">
                  {student.link_code}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                <Button
                  size="sm"
                  onClick={() => handleCopyKey(student.link_code)}
                  className="bg-white hover:bg-slate-100 text-indigo-900 font-bold rounded-lg h-9 shadow-sm"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedKey ? "Copied!" : "Copy Key"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyAll(student.name, student.link_code)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold rounded-lg h-9"
                  title="Copy full instructions and credentials"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-300 mr-1" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
                  {copiedAll ? "Copied All!" : "Copy All Details"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={regenerating}
                  onClick={handleRegenerateKey}
                  className="text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg h-9 text-xs"
                  title="Generate a new key"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TOP LIVE STUDENT SELECTOR STRIP ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        
        {/* Student Selector / Active Pill */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {student.name.charAt(0)}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                {student.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Now
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {student.academic_level || "Grade 11 ML & CS Track"} • Subject: {student.subject}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center print:hidden">
          {students.length > 1 && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStudentSwitch(s.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedStudentId === s.id
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
            Weekly Summary
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLinkModal(true)}
            className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
            Link Student
          </Button>

          <button
            type="button"
            onClick={() => loadDashboardData(selectedStudentId || undefined)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh live telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 3. HERO / CHILD PROFILE SUMMARY BANNER ── */}
      <section className="relative w-full rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Ambient Accent Glow behind header */}
        <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                Weekly Synthesis Active
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Cycle 18 • Continuous Evaluation Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {currentUser?.name ? `Welcome back, ${currentUser.name}` : `Welcome back, Parent`}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Here is {student.name}&apos;s weekly learning progression, adaptive mastery, and AI tutor engagement.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center print:hidden">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="rounded-xl text-sm font-semibold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100"
            >
              <Download className="w-4 h-4 text-indigo-600 mr-2" />
              Download Weekly Report (PDF)
            </Button>
            <Button
              onClick={() => setShowAdvisorModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share with Mentor
            </Button>
          </div>
        </div>

        {/* Student Key Status Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-lg flex-shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">{student.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{student.academic_level || "Grade 11 ML & CS Track"}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center px-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cognitive Caliber</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {student.cognitive_caliber || "Level 3.2 Dynamic"}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                <Zap className="w-3 h-3 fill-current" /> Calibrated
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center px-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overall Mastery</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {Math.round(student.overall_mastery)}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                +4.2% this week
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center px-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Weekly Pace</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {report.today_stats.active_minutes_today ? `${(report.today_stats.active_minutes_today / 60).toFixed(1)} hrs` : "4.5 hrs"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ 5.0h target</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. LIVE STUDY ACTIVITY • WHAT AARAV IS DOING RIGHT NOW ── */}
      {liveStudy && (
        <section className="w-full bg-gradient-to-r from-white via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 rounded-2xl p-6 sm:p-7 border-2 border-indigo-200/80 dark:border-indigo-900/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Live Study Activity • What {student.name} is Doing Right Now
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {liveStudy.session_time_str}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct telemetry stream from {student.name}&apos;s active Adapted AI learning workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap print:hidden">
              <Button
                onClick={handleSendEncouragement}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <ThumbsUp className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                Send Quick Encouragement 👍
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranscriptModal(true)}
                className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700"
              >
                <MessageCircle className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                Inspect Topic Log
              </Button>
            </div>
          </div>

          {/* Live Status Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* Card 1: Current Activity */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Current Activity
                </span>
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {liveStudy.current_activity}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {liveStudy.current_activity_detail}
              </p>
            </div>

            {/* Card 2: Last Interaction */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Last Interaction ({liveStudy.last_interaction_time})
                </span>
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                {liveStudy.last_interaction_prompt}
              </p>
              <span className="inline-block mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                {liveStudy.last_interaction_response}
              </span>
            </div>

            {/* Card 3: Focus Metric */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                    Real-time Focus Metric
                  </span>
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {liveStudy.focus_metric}%
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {liveStudy.focus_status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {liveStudy.focus_detail}
                </p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700" 
                  style={{ width: `${liveStudy.focus_metric}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. ENROLLED COURSES (7 COLS) + TODAY'S STUDY TIMELINE (5 COLS) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Enrolled Courses & Progress Mastery */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Enrolled Courses &amp; Progress Mastery
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Active track curriculum breakdown for {student.academic_level || "Grade 11 ML & CS"}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {courses.length} Active Courses
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              {courses.map((course, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {course.title}
                      </span>
                    </div>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {course.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-700" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span>{course.module_info}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{course.projected_completion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Curriculum standard: National AI &amp; CS Foundation</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Next Sync Assessment: Nov 28</span>
          </div>
        </div>

        {/* Right 5 cols: Today's Study Timeline */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Today&apos;s Study Timeline
              </h2>
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                <Clock className="w-3.5 h-3.5" /> 1h 15m today
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Detailed chronological session events logged today
            </p>

            {/* Vertical timeline */}
            <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timeline.map((evt, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  <span className={`absolute -left-5 mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                    evt.is_active ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"
                  }`}></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {evt.time_str}
                      </span>
                      {evt.is_active && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold uppercase">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {evt.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      {evt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak pill */}
          <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>7-day active study streak</span>
            </div>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              5.7 hrs / 5.0h weekly target
            </span>
          </div>
        </div>
      </section>

      {/* ── 6. 3 HIGH-LEVEL METRIC CARDS ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Curriculum Pace */}
        {pace && (
          <div className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Curriculum Pace
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {pace.status}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {pace.milestone_pct}% Milestone
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {pace.next_target}
              </p>
            </div>

            <div className="mt-5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-700" 
                  style={{ width: `${pace.milestone_pct}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                <span>{pace.current_module}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pace.milestone_pct}% Complete</span>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Practice Accuracy */}
        {accuracy && (
          <div className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Practice Accuracy
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  {accuracy.quizzes_count} Quizzes
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {accuracy.accuracy_pct}%
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  {accuracy.diff_str}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Strong performance on Bayesian formulation and forward-pass derivations.
              </p>
            </div>

            {/* Sparkline Visual */}
            <div className="mt-5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-1.5 h-10">
              {accuracy.sparkline.map((score, idx) => (
                <div 
                  key={idx} 
                  className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                  style={{
                    height: `${Math.max(25, score)}%`,
                    backgroundColor: idx === accuracy.sparkline.length - 1 ? "#4f46e5" : idx === accuracy.sparkline.length - 2 ? "#818cf8" : "#cbd5e1"
                  }}
                  title={`Quiz ${idx + 1}: ${score}%`}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Card 3: AI Tutor Assistance */}
        {aiAssist && (
          <div className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  AI Tutor Assistance
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {aiAssist.status}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {aiAssist.doubts_resolved} Doubts Resolved
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {aiAssist.note}
              </p>
            </div>

            <div className="mt-5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="inline-block w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-center leading-6 text-[10px] font-bold">Q1</span>
                <span className="inline-block w-6 h-6 rounded-full bg-indigo-600 text-white text-center leading-6 text-[10px] font-bold">Q2</span>
                <span className="inline-block w-6 h-6 rounded-full bg-blue-500 text-white text-center leading-6 text-[10px] font-bold">Q3</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Avg latency {aiAssist.avg_latency || "1.4s with multimodal graphs"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ── 7. ADAPTIVE INTELLIGENCE INSIGHTS (7 COLS) + WEEKLY CONSISTENCY (5 COLS) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Adaptive Insights */}
        {insights && (
          <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Adaptive Intelligence Insights
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time Bayesian difficulty mapping &amp; dynamic RAG interventions
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                Active Engine
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Adapted AI continuously calibrates challenge depth to keep {student.name} in their optimal learning zone—preventing both cognitive fatigue and conceptual frustration.
            </p>

            <div className="space-y-3.5 flex-1">
              {/* Remediation drill */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Active Remediation Drill
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{insights.remediation.gap}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {insights.remediation.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {insights.remediation.description}
                </p>
                <div className="flex items-center gap-2 mt-3 pt-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{insights.remediation.drills_info}</span>
                  <span className="text-slate-400">• {insights.remediation.timing}</span>
                </div>
              </div>

              {/* Demonstrated Mastery */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Demonstrated Mastery • {insights.mastery.score}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{insights.mastery.caliber}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {insights.mastery.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {insights.mastery.description}
                </p>
                <div className="flex items-center gap-1.5 mt-3 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{insights.mastery.milestone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right 5 cols: Weekly Consistency Bar Chart */}
        {consistency && (
          <div className="lg:col-span-5 flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Weekly Consistency
                </h2>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {consistency.total_hours}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Logged over 7 consecutive active study days
              </p>

              {/* 7-Day Bar Graph */}
              <div className="grid grid-cols-7 gap-2 items-end h-44 pb-2 border-b border-slate-100 dark:border-slate-800">
                {consistency.days.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                    <span className="text-[11px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.minutes}m
                    </span>
                    <div 
                      className={`w-full rounded-lg transition-all ${
                        d.is_peak 
                          ? "bg-indigo-600 dark:bg-indigo-500 shadow-sm" 
                          : "bg-indigo-100 dark:bg-indigo-950/80 group-hover:bg-indigo-200"
                      }`}
                      style={{ height: `${d.height_pct}%` }}
                    ></div>
                    <span className={`text-xs font-semibold ${d.is_peak ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-400"}`}>
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive Window Callout */}
            <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {consistency.optimal_window}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Demonstrating consistent rhythm and balanced cognitive stamina.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── 8. RECENT DIAGNOSTIC MILESTONES & TOPICS COVERED ── */}
      <section className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Recent Diagnostic Milestones &amp; Topics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous evaluation outcomes mapped to the National CS &amp; AI Framework
            </p>
          </div>
          <button
            onClick={() => setShowTranscriptModal(true)}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>View Full Learning Transcript</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors gap-2">
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {m.title}
                    </p>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                      {m.module}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {m.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 pl-13 sm:pl-0">
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{m.score}%</span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{m.caliber_gain}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{m.date_str}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:inline" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. PARENTAL CONTROLS & QUIET ADVISORY FOOTER ── */}
      <footer className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle SMS */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={handleToggleSms}>
          <div className="relative inline-flex items-center">
            <input 
              type="checkbox" 
              checked={smsDigestEnabled} 
              onChange={handleToggleSms}
              className="sr-only" 
            />
            <div className={`w-11 h-6 rounded-full transition-colors relative ${smsDigestEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-xs ${smsDigestEnabled ? "translate-x-5" : "translate-x-0"}`}></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Weekly SMS &amp; WhatsApp digests
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct snapshot sent every Sunday at 7:00 PM IST
            </p>
          </div>
        </div>

        {/* Schedule Advisor Button */}
        <div className="flex items-center gap-3 print:hidden">
          <Button
            onClick={() => setShowAdvisorModal(true)}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-2xs"
          >
            <HeartHandshake className="w-4 h-4 text-indigo-600 mr-2" />
            Schedule 1-on-1 with Academic Advisor
          </Button>
        </div>
      </footer>

      {/* ── MODAL: ACADEMIC TRANSCRIPT MODAL ── */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Official Learning Transcript • {student.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive topic mastery record &amp; historical assessment metrics
                </p>
              </div>
              <button 
                onClick={() => setShowTranscriptModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-3">
              {report.mastery_map.length > 0 ? (
                report.mastery_map.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t.topic}</p>
                      <span className="text-xs text-slate-500 capitalize">{t.band} Band</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{Math.round(t.mastery)}%</span>
                      <p className="text-[10px] text-slate-400">Mastery Score</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Foundational topic tree will expand as {student.name} completes practice sets.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={() => setShowTranscriptModal(false)} className="rounded-xl">
                Close Transcript
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE 1-ON-1 ADVISOR ── */}
      {showAdvisorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Academic Advisor Call
                </h3>
              </div>
              <button 
                onClick={() => { setShowAdvisorModal(false); setAdvisorSubmitted(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {advisorSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Call Scheduled!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  An invitation has been sent to your email. Our senior academic mentor will walk through {student.name}&apos;s learning path and answer any questions.
                </p>
                <Button onClick={() => { setShowAdvisorModal(false); setAdvisorSubmitted(false); }} className="rounded-xl mt-2 w-full">
                  Done
                </Button>
              </div>
            ) : (
              <div className="py-4 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Student Name
                  </label>
                  <input
                    disabled
                    value={student.name}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Preferred Session Topic
                  </label>
                  <input
                    value={advisorTopic}
                    onChange={(e) => setAdvisorTopic(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Preferred Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={advisorDate}
                    onChange={(e) => setAdvisorDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => setShowAdvisorModal(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setAdvisorSubmitted(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm Appointment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: LINK ANOTHER STUDENT BY SYNC KEY ── */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Link Student with Sync Key
                </h3>
              </div>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkStudent} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Student Parent Sync Key or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. PAR-0001 or student@example.com"
                  required
                  value={linkCodeInput}
                  onChange={(e) => setLinkCodeInput(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-wider"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ask your child to open the Parent Portal in their panel to retrieve their unique Sync Key.
                </p>
              </div>

              {linkError && (
                <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  {linkError}
                </div>
              )}

              {linkSuccess && (
                <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                  {linkSuccess}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowLinkModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={linking}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  {linking ? "Connecting..." : "Connect Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
