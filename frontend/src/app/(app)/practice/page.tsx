"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Loader2, Target, Trophy, ArrowRight, CheckCircle2, XCircle, 
  Sparkles, BookOpen, AlertCircle, Zap, RotateCcw, 
  Brain, Clock, Flame, ChevronRight, Check, ArrowUp,
  Layers, HelpCircle, Award, BarChart2
} from "lucide-react";
import { fetchApi } from "@/lib";
import { 
  QuizGenerateResponse, QuizSubmitResponse 
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";

interface TopicOption {
  id: number;
  name: string;
  status?: string;
  mastery?: number;
}

interface QuizHistoryItem {
  id: number;
  score: number;
  difficulty: string;
  mastery_before: number;
  mastery_after: number;
  date: string;
  topic_name?: string;
}

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTopicId = searchParams.get("topic_id");

  // Topics & Configuration
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState<number>(5); // 5, 10, 15, 20 max
  const [showTopicPicker, setShowTopicPicker] = useState<boolean>(false);

  // User Stats & Caliber
  const [streakDays, setStreakDays] = useState<number>(6);
  const [overallMastery, setOverallMastery] = useState<number>(84);
  const [recentSessions, setRecentSessions] = useState<QuizHistoryItem[]>([]);

  // General error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quiz Lifecycle State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Preparing your adaptive session...");
  const [quiz, setQuiz] = useState<QuizGenerateResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  // Back to Top State
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load available topics from learning path
  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await fetchApi<{ items: { topic_id: number; topic: string; status: string; mastery: number }[] }>("/api/path");
        if (data?.items && data.items.length > 0) {
          const loadedTopics: TopicOption[] = data.items.map((it) => ({
            id: it.topic_id,
            name: it.topic,
            status: it.status,
            mastery: it.mastery,
          }));
          setTopics(loadedTopics);

          if (queryTopicId) {
            const parsed = parseInt(queryTopicId, 10);
            if (!isNaN(parsed) && loadedTopics.some((t) => t.id === parsed)) {
              setSelectedTopicId(parsed);
              return;
            }
          }

          // Default to the current focus topic or first available
          const current = loadedTopics.find((t) => t.status === "current") || loadedTopics[0];
          if (current) {
            setSelectedTopicId(current.id);
          }
        }
      } catch (err) {
        console.error("Failed to load topics:", err);
      }
    }
    loadTopics();
  }, [queryTopicId]);

  // Load user stats and quiz history
  useEffect(() => {
    async function loadStats() {
      try {
        const profile = await fetchApi<any>("/api/profile");
        if (profile) {
          if (profile.streak_days !== undefined) setStreakDays(profile.streak_days);
          if (profile.overall_mastery !== undefined) setOverallMastery(Math.round(profile.overall_mastery));
        }

        const report = await fetchApi<any>("/api/parent/report");
        if (report?.quiz_history && report.quiz_history.length > 0) {
          setRecentSessions(report.quiz_history.slice(0, 4));
        }
      } catch (err) {
        console.warn("Failed to load user stats for practice:", err);
      }
    }
    loadStats();
  }, []);

  // --- Quiz Handlers ---
  const startQuiz = async (customCount?: number, customDifficulty?: "easy" | "medium" | "hard", customTopicId?: number) => {
    const countToUse = customCount || questionCount;
    const diffToUse = customDifficulty || selectedDifficulty;
    const topicToUse = customTopicId || selectedTopicId;

    setLoading(true);
    setErrorMessage(null);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setShowAnswer(false);
    setLoadingStep("Grounding quiz in your course documents...");

    const stepTimer = setTimeout(() => {
      setLoadingStep(`AI is calibrating ${countToUse} adaptive MCQs for your mastery band...`);
    }, 1800);

    try {
      const data = await fetchApi<QuizGenerateResponse>("/api/quiz/generate", {
        method: "POST",
        body: JSON.stringify({ 
          topic_id: topicToUse, 
          difficulty: diffToUse,
          count: countToUse
        }),
      });
      setQuiz(data);
    } catch (err: any) {
      setErrorMessage(err.detail || "Failed to generate quiz. Ensure your AI API key is configured and materials are ready.");
    } finally {
      clearTimeout(stepTimer);
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    setLoading(true);
    setErrorMessage(null);
    setLoadingStep("Evaluating answers and computing Bayesian Mastery Delta...");

    try {
      const data = await fetchApi<QuizSubmitResponse>(`/api/quiz/${quiz.attempt_id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(data);

      // Refresh recent sessions after submission
      try {
        const report = await fetchApi<any>("/api/parent/report");
        if (report?.quiz_history) {
          setRecentSessions(report.quiz_history.slice(0, 4));
        }
      } catch {}
    } catch (err: any) {
      setErrorMessage(err.detail || "Failed to submit quiz.");
    } finally {
      setLoading(false);
    }
  };

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];
  const caliberScore = (overallMastery / 25).toFixed(1);

  // ==========================================
  // VIEW 1: ACTIVE QUIZ TAKING VIEW
  // ==========================================
  if (quiz && !result) {
    const q = quiz.questions[currentQuestionIdx];
    const totalQuestions = quiz.questions.length;
    const progressPct = ((currentQuestionIdx + 1) / totalQuestions) * 100;

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Quiz Header Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to exit this quiz? Your current progress will not be saved.")) {
                setQuiz(null);
              }
            }}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            ← Exit Session
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs capitalize font-medium border-slate-200 dark:border-slate-800">
              {quiz.topic}
            </Badge>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
              Question {currentQuestionIdx + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Progress</span>
            <span className="font-semibold">{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-2 bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Question Card */}
        <ScrollReveal pop={true}>
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize font-medium ${
                    q.difficulty === "easy" 
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800" 
                      : q.difficulty === "hard"
                      ? "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
                      : "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                  }`}
                >
                  {q.difficulty} Level
                </Badge>
                {q.concept_tag && (
                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-normal">
                    {q.concept_tag}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {q.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx;
                const isCorrect = q.correct_index === optIdx;

                let btnStyle = "border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200";
                if (showAnswer) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500";
                  } else if (isSelected) {
                    btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500";
                  } else {
                    btnStyle = "border-slate-100 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 opacity-50";
                  }
                } else if (isSelected) {
                  btnStyle = "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-600/30 font-medium";
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={showAnswer}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between group ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isSelected 
                          ? "bg-indigo-600 text-white" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {showAnswer && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                    {showAnswer && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 ml-2" />}
                  </button>
                );
              })}

              {/* Verified Explanation Drawer */}
              {showAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Conceptual Explanation</span>
                  </div>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300">{q.explanation}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                {answers[q.id] === undefined ? "Select an answer to proceed" : "Answer selected"}
              </span>

              <div className="flex items-center gap-3">
                {!showAnswer ? (
                  <Button 
                    onClick={() => setShowAnswer(true)} 
                    disabled={answers[q.id] === undefined}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5 py-2 h-9"
                  >
                    Check Answer
                  </Button>
                ) : currentQuestionIdx < totalQuestions - 1 ? (
                  <Button
                    onClick={() => {
                      setShowAnswer(false);
                      setCurrentQuestionIdx((i) => i + 1);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5 py-2 h-9 gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={submitQuiz} 
                    disabled={loading} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-2 h-9 gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="h-3.5 w-3.5 text-yellow-300" />
                        <span>Submit Quiz & Analyze</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </ScrollReveal>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: POST-ASSESSMENT IN-DEPTH ANALYSIS
  // ==========================================
  if (result) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        <ScrollReveal pop={true}>
          {/* Top Result Banner */}
          <div className="text-center space-y-3 pb-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold capitalize">
              <span>{result.topic}</span>
              <span>•</span>
              <span>{result.difficulty} Level</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Assessment Analysis Complete!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-lg mx-auto">
              You achieved <span className="font-bold text-slate-900 dark:text-white">{result.score.toFixed(0)}%</span> accuracy ({result.correct_count} of {result.total_questions} questions correct).
            </p>
          </div>
        </ScrollReveal>

        {/* 2-Column Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Mastery Delta */}
          <ScrollReveal delay={100} pop={true}>
            <Card className="h-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Mastery Calibration
                  </span>
                  <Badge 
                    className={`font-mono text-xs ${
                      result.mastery_delta >= 0 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" 
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {result.mastery_delta >= 0 ? `+${result.mastery_delta.toFixed(1)}%` : `${result.mastery_delta.toFixed(1)}%`}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time Bayesian knowledge estimate update
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Current Mastery Level</span>
                    <span className="font-bold text-slate-900 dark:text-white">{result.mastery_after.toFixed(1)}%</span>
                  </div>
                  <Progress value={result.mastery_after} className="h-3 bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 mb-0.5">Pre-assessment</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {result.mastery_before.toFixed(1)}% <span className="text-[10px] text-slate-400 capitalize">({result.band_before})</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                    <p className="text-indigo-600 dark:text-indigo-400 mb-0.5">Post-assessment</p>
                    <p className="font-bold text-indigo-950 dark:text-indigo-200">
                      {result.mastery_after.toFixed(1)}% <span className="text-[10px] text-indigo-500 capitalize">({result.band_after})</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Card 2: Adaptive Action & Weak Concepts */}
          <ScrollReveal delay={150} pop={true}>
            <Card className="h-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Next Recommended Action
                </CardTitle>
                <CardDescription className="text-xs">
                  Prescribed adaptation based on mistake analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {result.next_action.reason}
                </p>

                {result.weak_concepts && result.weak_concepts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Identified Focus Areas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.weak_concepts.map((concept, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                {result.weak_concepts && result.weak_concepts.length > 0 ? (
                  <Link 
                    href={`/challenges?topic_id=${result.topic_id}&concept=${encodeURIComponent(result.weak_concepts[0])}`}
                    className="w-full"
                  >
                    <Button 
                      className="w-full font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10 shadow-xs"
                    >
                      <Zap className="h-4 w-4 text-yellow-300" />
                      <span>Conquer "{result.weak_concepts[0]}" in Coding Lab</span>
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={() => {
                      setResult(null);
                      setQuiz(null);
                    }}
                    className="w-full font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Practice Next Concept</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </ScrollReveal>
        </div>

        {/* Path Changes Notification */}
        {result.path_changed && result.path_changes && result.path_changes.length > 0 && (
          <ScrollReveal delay={200} pop={true}>
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                  Learning Path Milestone Unlocked!
                </h4>
                {result.path_changes.map((change, idx) => (
                  <p key={idx} className="text-xs text-indigo-800 dark:text-indigo-300">
                    • <strong>{change.topic}</strong> updated from <span className="capitalize">{change.from}</span> to <strong className="capitalize">{change.to}</strong>: {change.reason}
                  </p>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Detailed Question Review & Explanations */}
        <ScrollReveal delay={250} pop={true}>
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Comprehensive Question Breakdown ({result.total_questions} Questions)
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect every answer, correct solutions, and AI conceptual derivations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.review.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border transition-all ${
                    item.is_correct 
                      ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20" 
                      : "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1}</span>
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.question}</span>
                    </div>
                    {item.is_correct ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full shrink-0">
                        <XCircle className="h-3.5 w-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3">
                    <div className={`p-2.5 rounded-lg font-medium ${
                      item.is_correct 
                        ? "bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200" 
                        : "bg-rose-100/70 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200"
                    }`}>
                      <span className="opacity-70">Your selection: </span>{item.your_answer}
                    </div>
                    {!item.is_correct && (
                      <div className="p-2.5 rounded-lg bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-medium">
                        <span className="opacity-70">Expected correct: </span>{item.correct_answer}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">AI Explanation: </span>
                    <p className="leading-relaxed">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setQuiz(null);
                }}
                className="text-xs font-medium"
              >
                Practice Another Topic
              </Button>
              <div className="flex items-center gap-3">
                <Link href="/challenges">
                  <Button variant="outline" className="text-xs font-medium gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-indigo-600" />
                    Go to Coding Challenges
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </ScrollReveal>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: PRACTICE HOMEPAGE (MATCHING USER TEMPLATE)
  // ==========================================
  return (
    <div className="space-y-8 pb-16">
      {/* Title & Context Bar */}
      <ScrollReveal pop={false}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 dark:border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Adaptive Practice
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Calibrated in real-time to your mastery profile and target milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs text-slate-700 dark:text-slate-300">
              <Brain className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
              <span className="font-semibold text-xs sm:text-sm">Caliber {caliberScore}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 capitalize">{overallMastery >= 80 ? "Advanced" : overallMastery >= 60 ? "Developing" : "Beginner"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs text-slate-700 dark:text-slate-300">
              <Flame className="text-amber-500 w-4 h-4" />
              <span className="font-semibold text-xs sm:text-sm">{streakDays} Days</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {errorMessage && (
        <ScrollReveal pop={true}>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </ScrollReveal>
      )}

      {/* Centerpiece Hero: Recommended Session Card */}
      <ScrollReveal delay={100} pop={true}>
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Recommended Practice Session
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {activeTopic?.name || "Neural Architecture & Representation"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2.5 leading-relaxed">
                Targeted conceptual derivations, scaling dimensions, and foundational problems designed to strengthen topic mastery and reinforce active course materials.
              </p>
            </div>

            {/* Question Count Selector (5, 10, 15, 20 MCQs Max) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Number of Questions (Up to 20 MCQs):
                </span>
                <span className="text-slate-400">Adaptive calibration</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[5, 10, 15, 20].map((num) => {
                  const isSelected = questionCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-white font-bold ring-2 ring-indigo-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-base font-bold">{num} MCQs</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {num === 5 ? "Quick · ~6 mins" : num === 10 ? "Standard · ~12 mins" : num === 15 ? "Deep · ~18 mins" : "Comprehensive · ~25 mins"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Picker */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Difficulty Level:
              </span>
              <div className="grid grid-cols-3 gap-2.5 max-w-sm">
                {(["easy", "medium", "hard"] as const).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold capitalize transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Quick Specs */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{questionCount * 2}–{questionCount * 2 + 4} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>{questionCount} adaptive questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400" />
                <span>Caliber Level {caliberScore}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Button
                onClick={() => startQuiz()}
                disabled={loading || topics.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 h-12 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm shadow-indigo-600/25 active:scale-[0.98] gap-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing Session...</span>
                  </>
                ) : (
                  <>
                    <span>Start Practice</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowTopicPicker(!showTopicPicker)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-5 py-3.5 h-12 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {showTopicPicker ? "Hide Topics" : "Change Topic"}
              </Button>
            </div>

            {/* Topic Picker Drawer */}
            {showTopicPicker && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Select Topic from Your Learning Path:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {topics.map((t) => {
                    const isSelected = t.id === selectedTopicId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTopicId(t.id);
                          setShowTopicPicker(false);
                        }}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-indigo-600 bg-white dark:bg-slate-900 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-white font-bold"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="truncate font-medium">{t.name}</p>
                          <span className="text-[10px] text-slate-400 capitalize">{t.status?.replace("_", " ") || "Available"}</span>
                        </div>
                        {t.mastery !== undefined && (
                          <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                            {t.mastery.toFixed(0)}%
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Secondary Practice Modes & Recent Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Alternative Practice Modes */}
        <div className="lg:col-span-2 space-y-4">
          <ScrollReveal delay={150}>
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Alternative Practice Modes</h3>
              <span className="text-xs text-slate-400">Choose your pace</span>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {/* Mode 1: Quick Diagnostic */}
            <ScrollReveal delay={200} pop={true}>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-4 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Quick Diagnostic</h4>
                    <span className="text-xs text-slate-400 font-medium">· 5 mins · 5 Qs</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rapid conceptual retention check across active machine learning modules.
                  </p>
                </div>
                <button 
                  onClick={() => startQuiz(5, "medium")}
                  disabled={loading}
                  className="shrink-0 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <span>Start</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>

            {/* Mode 2: Deep Focus Review */}
            <ScrollReveal delay={250} pop={true}>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-4 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Deep Focus Review</h4>
                    <span className="text-xs text-slate-400 font-medium">· 20 mins · 20 Qs</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complex mathematical derivations and multi-step proofs on weak concepts.
                  </p>
                </div>
                <button 
                  onClick={() => startQuiz(20, "hard")}
                  disabled={loading}
                  className="shrink-0 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <span>Start</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>

            {/* Mode 3: Spaced Review */}
            <ScrollReveal delay={300} pop={true}>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-4 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Spaced Review</h4>
                    <span className="text-xs text-slate-400 font-medium">· 10 mins · 10 Qs</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Targeted reinforcement spaced along the forgetting curve for theorem memory.
                  </p>
                </div>
                <button 
                  onClick={() => startQuiz(10, "medium")}
                  disabled={loading}
                  className="shrink-0 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <span>Start</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Right 1 Col: Recent Sessions History Widget */}
        <div className="space-y-4">
          <ScrollReveal delay={200}>
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Sessions</h3>
              <span className="text-xs text-slate-400">Past 7 days</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={250} pop={true}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {recentSessions.length > 0 ? (
                recentSessions.map((session, idx) => (
                  <div key={session.id || idx} className="p-4 flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {session.topic_name || `Session #${session.id || (idx + 1)}`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                        {session.date || "Recent"} · {session.difficulty}
                      </p>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold ${
                      session.score >= 80 ? "text-emerald-600 dark:text-emerald-400" : session.score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {session.score.toFixed(0)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                  <p>No recent sessions completed yet.</p>
                  <p className="text-[11px]">Start your first adaptive quiz above!</p>
                </div>
              )}
            </div>

            {/* Subtle Accuracy Pill */}
            <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Caliber maintained at {caliberScore} ({overallMastery}% mastery)</span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Floating Back to Top Arrow */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all z-50 animate-bounce hover:scale-110"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
