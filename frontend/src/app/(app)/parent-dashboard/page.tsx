"use client";

import { useState, useEffect } from "react";
import { 
  Users, Clock, Trophy, Target, BookOpen, AlertCircle, 
  CheckCircle2, Sparkles, Printer, UserPlus, Flame, 
  MessageSquare, FileText, ChevronRight, RefreshCw, Loader2,
  HelpCircle, ShieldCheck, HeartHandshake, TrendingUp, Calendar
} from "lucide-react";
import { fetchApi } from "@/lib";
import { ParentReport, ParentStudentSummary, Band } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

export default function ParentDashboardPage() {
  const [report, setReport] = useState<ParentReport | null>(null);
  const [students, setStudents] = useState<ParentStudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Link child state
  const [linkCodeInput, setLinkCodeInput] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const loadDashboardData = async (studentId?: number) => {
    try {
      setError(null);
      
      // Load linked students list
      const studentsData = await fetchApi<{ students: ParentStudentSummary[] }>("/api/parent/students");
      setStudents(studentsData.students || []);

      const targetId = studentId || (studentsData.students?.[0]?.id ?? null);
      setSelectedStudentId(targetId);

      // Load report
      const queryParam = targetId ? `?student_id=${targetId}` : "";
      const reportData = await fetchApi<ParentReport>(`/api/parent/report${queryParam}`);
      setReport(reportData);
    } catch (err: any) {
      setError(err.detail || "Unable to load student progress report. Link a student account to get started.");
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

      setLinkSuccess(`Successfully connected to ${res.student_name}'s learning profile!`);
      setLinkCodeInput("");
      setShowLinkModal(false);
      await loadDashboardData(res.student_id);
    } catch (err: any) {
      setLinkError(err.detail || "Could not find a student matching that Parent Link Code.");
    } finally {
      setLinking(false);
    }
  };

  const getBandBadge = (band: Band) => {
    switch (band) {
      case "mastered":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Mastered</Badge>;
      case "competent":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Competent</Badge>;
      case "developing":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Developing</Badge>;
      default:
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Needs Support</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500 font-medium">Syncing with student's live learning activities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 print:p-0 print:space-y-4">
      {/* Header & Student Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 print:border-none">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Parent Sync Portal
            </h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live Synced
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time daily activity audit log, curriculum mastery, and AI-powered parental guidance tips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          {/* Linked Student Selector Pills */}
          {students.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStudentSwitch(s.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedStudentId === s.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLinkModal(!showLinkModal)} 
            className="gap-1.5 text-xs font-medium"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Link Student
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setRefreshing(true); loadDashboardData(selectedStudentId || undefined); }}
            disabled={refreshing}
            className="gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button 
            size="sm" 
            onClick={() => window.print()} 
            className="gap-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Weekly Report
          </Button>
        </div>
      </div>

      {/* Link Student Collapse/Modal */}
      {showLinkModal && (
        <Card className="border-indigo-200 bg-indigo-50/40 p-4 shadow-xs print:hidden animate-fade-in">
          <form onSubmit={handleLinkStudent} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Enter your child's <strong>Parent Link Code</strong> (found on student's profile, e.g. STUDENT-0001) or their student email:
              </label>
              <Input
                placeholder="e.g. STUDENT-0001 or student@example.com"
                value={linkCodeInput}
                onChange={(e) => setLinkCodeInput(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-5">
              <Button type="submit" disabled={linking || !linkCodeInput.trim()} size="sm" className="gap-1.5">
                {linking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Connect Child
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
          {linkError && <p className="text-xs text-rose-600 mt-2">{linkError}</p>}
          {linkSuccess && <p className="text-xs text-emerald-600 mt-2 font-medium">{linkSuccess}</p>}
        </Card>
      )}

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
          <h3 className="font-semibold text-slate-800">No Student Linked Yet</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {error}
          </p>
          <Button onClick={() => setShowLinkModal(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Link Your Child Now
          </Button>
        </div>
      ) : report ? (
        <>
          {/* Top Key Metrics Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Student Info */}
            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Student Profile</span>
                  <Badge variant="secondary" className="text-[11px] font-mono">{report.student.link_code}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2 truncate">{report.student.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {report.student.subject} • {report.student.academic_level}
                </p>
                <div className="mt-3 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                  Goal: {report.student.goal}
                </div>
              </CardContent>
            </Card>

            {/* Today's Active Time */}
            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Today's Active Study Time</span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {report.today_stats.active_minutes_today}
                  </span>
                  <span className="text-xs text-slate-400">/ {report.student.study_time_goal} min target</span>
                </div>
                <Progress 
                  value={Math.min(100, (report.today_stats.active_minutes_today / (report.student.study_time_goal || 60)) * 100)} 
                  className="h-1.5 mt-3" 
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  {report.today_stats.total_actions_today} actions logged today
                </p>
              </CardContent>
            </Card>

            {/* Overall Curriculum Mastery */}
            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Curriculum Mastery</span>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {report.student.overall_mastery.toFixed(0)}%
                  </span>
                  <Badge variant="outline" className="text-[11px] border-emerald-200 text-emerald-700 bg-emerald-50">
                    {report.student.overall_mastery >= 70 ? "Competent" : "In Progress"}
                  </Badge>
                </div>
                <Progress value={report.student.overall_mastery} className="h-1.5 mt-3" />
                <p className="text-[11px] text-slate-500 mt-2">
                  Trend: <span className="capitalize font-semibold text-slate-700">{report.recent_trend}</span>
                </p>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Consistency Streak</span>
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {report.student.streak_days}
                  </span>
                  <span className="text-xs text-slate-500">consecutive days</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Platform usage active</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Report generated {report.generated_at}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI PARENT ADVISOR - THE WOW FACTOR */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-white to-indigo-50/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                      AI Parent Advisor
                      <Badge className="bg-primary text-white text-[10px] font-semibold tracking-wide uppercase">
                        Gemini Insights
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Plain-English translation of your child's weekly study patterns and constructive dinner tips
                    </CardDescription>
                  </div>
                </div>
                <HeartHandshake className="h-5 w-5 text-primary/40 hidden sm:block" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-xs [&_p]:text-slate-600 [&_ul]:text-xs [&_li]:text-slate-600">
                <ReactMarkdown>{report.ai_advisor}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Split Section: Activity Timeline & Live Mastery Map */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Section A: Today's Activity Timeline (Audit Log) - 6 cols */}
            <Card className="lg:col-span-6 border-slate-200 shadow-2xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-base">Today's Activity Audit Trail</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-normal text-slate-500">
                    Live Feed
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Exact timestamps of documents uploaded, AI tutor questions asked, and quizzes taken
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {report.activities.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No learning activities recorded yet today. When your child starts studying, their timeline will appear here live.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {report.activities.map((act) => {
                      const isQuiz = act.activity_type === "quiz";
                      const isChat = act.activity_type === "chat";
                      const isUpload = act.activity_type === "upload";

                      return (
                        <div key={act.id} className="relative group">
                          {/* Dot */}
                          <div className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs ${
                            isQuiz ? "bg-amber-500" : isChat ? "bg-blue-500" : "bg-emerald-500"
                          }`} />

                          <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-150 hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                                {isQuiz && <Target className="h-3.5 w-3.5 text-amber-600" />}
                                {isChat && <MessageSquare className="h-3.5 w-3.5 text-blue-600" />}
                                {isUpload && <FileText className="h-3.5 w-3.5 text-emerald-600" />}
                                <span className="capitalize">{act.activity_type}</span>
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">{act.time_str}</span>
                            </div>

                            <p className="text-xs text-slate-600 mt-1">
                              {act.description}
                            </p>

                            {act.result?.score !== undefined && (
                              <div className="mt-2 flex items-center gap-2 text-[11px]">
                                <span className="font-semibold text-slate-800">
                                  Score: {act.result.score}%
                                </span>
                                {act.result.mastery_delta !== undefined && (
                                  <span className={act.result.mastery_delta >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                                    ({act.result.mastery_delta >= 0 ? "+" : ""}{act.result.mastery_delta.toFixed(0)}% mastery delta)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section B: Live Mastery Report & Curriculum Breakdown - 6 cols */}
            <Card className="lg:col-span-6 border-slate-200 shadow-2xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-base">Curriculum Mastery Map</CardTitle>
                  </div>
                  <span className="text-xs text-slate-400">70%+ to Master</span>
                </div>
                <CardDescription className="text-xs">
                  Topic-by-topic comprehension score calculated by the Exponential Moving Average engine
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                {/* Strengths & Weaknesses Quick Summary */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-150">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 block mb-1">
                      Strong Concepts:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {report.strengths.length > 0 ? (
                        report.strengths.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800">
                            {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">Practicing foundations</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-rose-700 block mb-1">
                      Needs Encouragement:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {report.weaknesses.length > 0 ? (
                        report.weaknesses.map((w, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] bg-rose-100 text-rose-800">
                            {w}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">All current topics stable</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Topic Progress Bars */}
                <div className="space-y-3 pt-1">
                  {report.mastery_map.map((item) => (
                    <div key={item.topic_id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{item.topic}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{item.mastery.toFixed(0)}%</span>
                          {getBandBadge(item.band)}
                        </div>
                      </div>
                      <Progress 
                        value={item.mastery} 
                        className={`h-2 ${
                          item.mastery >= 70 
                            ? "[&>div]:bg-emerald-500" 
                            : item.mastery >= 50 
                            ? "[&>div]:bg-blue-500" 
                            : item.mastery >= 30 
                            ? "[&>div]:bg-amber-500" 
                            : "[&>div]:bg-rose-500"
                        }`} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
