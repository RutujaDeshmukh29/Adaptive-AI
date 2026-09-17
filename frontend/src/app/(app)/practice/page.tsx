"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Loader2, Target, Trophy, ArrowRight, CheckCircle2, XCircle, 
  Sparkles, BookOpen, AlertCircle, Code2, Zap, RotateCcw, 
  Eye, EyeOff, Lightbulb, Check, ArrowLeft, Terminal, ShieldAlert 
} from "lucide-react";
import { fetchApi } from "@/lib";
import { 
  QuizGenerateResponse, QuizSubmitResponse, Challenge, 
  ChallengeEvaluation, WeakTopicsSummary 
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TopicOption {
  id: number;
  name: string;
  status?: string;
  mastery?: number;
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const queryTopicId = searchParams.get("topic_id");
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"quiz" | "challenge">(() => {
    return queryTab === "challenge" ? "challenge" : "quiz";
  });

  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // General error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Quiz State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Preparing your adaptive session...");
  const [quiz, setQuiz] = useState<QuizGenerateResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  // 2. Code Challenge State
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState("");
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeLoadingStep, setChallengeLoadingStep] = useState("Crafting targeted challenge...");
  const [challengeType, setChallengeType] = useState<"code" | "interview">("code");
  const [conceptFocus, setConceptFocus] = useState<string>("");
  const [unlockedHints, setUnlockedHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);
  const [evaluatingCode, setEvaluatingCode] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ChallengeEvaluation | null>(null);
  const [weakSummary, setWeakSummary] = useState<WeakTopicsSummary | null>(null);

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

  // Load weak sub-concepts diagnostic summary
  useEffect(() => {
    async function loadWeakSummary() {
      try {
        const data = await fetchApi<WeakTopicsSummary>("/api/challenge/weak-topics");
        if (data) {
          setWeakSummary(data);
        }
      } catch (err) {
        console.warn("Failed to load weak topics summary:", err);
      }
    }
    loadWeakSummary();
  }, []);

  // --- Quiz Handlers ---
  const startQuiz = async () => {
    setLoading(true);
    setErrorMessage(null);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setShowAnswer(false);
    setLoadingStep("Grounding quiz in your course documents...");

    const stepTimer = setTimeout(() => {
      setLoadingStep("Gemini AI is crafting adaptive questions for your level...");
    }, 2000);

    try {
      const data = await fetchApi<QuizGenerateResponse>("/api/quiz/generate", {
        method: "POST",
        body: JSON.stringify({ topic_id: selectedTopicId, difficulty: selectedDifficulty }),
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
    setLoadingStep("Evaluating answers and updating your Mastery Band...");

    try {
      const data = await fetchApi<QuizSubmitResponse>(`/api/quiz/${quiz.attempt_id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(data);
    } catch (err: any) {
      setErrorMessage(err.detail || "Failed to submit quiz.");
    } finally {
      setLoading(false);
    }
  };

  // --- Challenge Handlers ---
  const startChallenge = async (customFocus?: string) => {
    setChallengeLoading(true);
    setErrorMessage(null);
    setEvaluationResult(null);
    setUnlockedHints(0);
    setShowSolution(false);
    setChallengeLoadingStep("Analyzing your weak sub-concepts and local notes...");

    const focusToUse = customFocus !== undefined ? customFocus : (conceptFocus.trim() || undefined);

    try {
      const data = await fetchApi<Challenge>("/api/challenge/generate", {
        method: "POST",
        body: JSON.stringify({
          topic_id: selectedTopicId,
          difficulty: selectedDifficulty,
          type: challengeType,
          concept_focus: focusToUse,
        }),
      });
      setChallenge(data);
      setUserCode(data.starter_code);
    } catch (err: any) {
      setErrorMessage(err.detail || "Failed to generate coding challenge. Please try again.");
    } finally {
      setChallengeLoading(false);
    }
  };

  const submitChallenge = async () => {
    if (!challenge) return;
    setEvaluatingCode(true);
    setErrorMessage(null);

    try {
      const data = await fetchApi<ChallengeEvaluation>("/api/challenge/evaluate", {
        method: "POST",
        body: JSON.stringify({
          challenge_id: challenge.id,
          title: challenge.title,
          topic_id: challenge.topic_id,
          topic_name: challenge.topic_name,
          difficulty: challenge.difficulty,
          type: challenge.type,
          scenario: challenge.scenario,
          user_code: userCode,
          solution: challenge.solution,
        }),
      });
      setEvaluationResult(data);

      if (data.mastery_updated && data.new_mastery !== undefined) {
        setTopics((prev) =>
          prev.map((t) =>
            t.id === challenge.topic_id ? { ...t, mastery: data.new_mastery } : t
          )
        );
      }
    } catch (err: any) {
      setErrorMessage(err.detail || "Failed to evaluate challenge solution.");
    } finally {
      setEvaluatingCode(false);
    }
  };

  const activeTopic = topics.find((t) => t.id === selectedTopicId);

  // Tab Switcher Component
  const ModeSwitcher = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("quiz");
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "quiz"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Target className="h-4 w-4 text-primary" />
          <span>Adaptive Quiz</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("challenge");
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "challenge"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Code2 className="h-4 w-4 text-indigo-600" />
          <span>Code Challenge Lab</span>
          <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 py-0 px-1.5 font-normal">
            AI Target
          </Badge>
        </button>
      </div>
    </div>
  );

  // ==========================================
  // VIEW: CODE CHALLENGE LAB (WHEN ACTIVE)
  // ==========================================
  if (activeTab === "challenge") {
    // 2A. Challenge Active Coding Workspace
    if (challenge) {
      return (
        <div className="max-w-6xl mx-auto py-4 space-y-6">
          <ModeSwitcher />

          {/* Workspace Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setChallenge(null);
                  setEvaluationResult(null);
                }}
                className="h-8 gap-1 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {challenge.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-slate-50">
                    {challenge.topic_name}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${
                      challenge.difficulty === "easy" 
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                        : challenge.difficulty === "hard" 
                        ? "text-rose-700 bg-rose-50 border-rose-200" 
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}
                  >
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Target: {challenge.targeted_weakness}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserCode(challenge.starter_code)}
              className="text-xs gap-1.5 h-8 text-slate-600 hover:text-slate-900"
              title="Reset code to starter template"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Code
            </Button>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Two-Column Coding Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Problem, Requirements, Test Cases & Hints */}
            <div className="lg:col-span-5 space-y-4">
              {/* Scenario & Requirements */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    Problem Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-slate-700">
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-normal">
                    {challenge.scenario}
                  </p>

                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-2">
                      Requirements & Constraints:
                    </h4>
                    <ul className="space-y-1.5">
                      {challenge.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Test Cases */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Sample Test Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {challenge.test_cases.map((tc, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-1 font-mono">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Case #{i + 1}</span>
                        {tc.explanation && <span className="font-sans text-slate-400">{tc.explanation}</span>}
                      </div>
                      <div className="text-slate-800">
                        <span className="text-slate-400 font-sans">Input: </span>
                        {tc.input}
                      </div>
                      <div className="text-emerald-700 font-semibold">
                        <span className="text-slate-400 font-sans">Expected: </span>
                        {tc.expected}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Progressive Hints Accordion */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Progressive Hints ({unlockedHints}/{challenge.hints.length})
                  </CardTitle>
                  {unlockedHints < challenge.hints.length && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUnlockedHints((prev) => prev + 1)}
                      className="h-7 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                    >
                      Unlock Hint {unlockedHints + 1}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {unlockedHints === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Stuck? Click "Unlock Hint" for progressive clues without spoiling the solution.
                    </p>
                  ) : (
                    challenge.hints.slice(0, unlockedHints).map((h, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        <span className="font-semibold text-amber-800 mr-1">Hint {i + 1}:</span>
                        {h}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Official Solution Reveal */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    Reference Solution & Big-O
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSolution((prev) => !prev)}
                    className="h-7 text-xs text-slate-600 gap-1"
                  >
                    {showSolution ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{showSolution ? "Hide" : "Reveal"}</span>
                  </Button>
                </CardHeader>
                {showSolution && (
                  <CardContent className="space-y-3 pt-2 text-xs">
                    <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono overflow-x-auto text-[11px] leading-relaxed">
                      <code>{challenge.solution}</code>
                    </pre>
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 leading-relaxed">
                      <span className="font-semibold">Analysis: </span>
                      {challenge.explanation}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right Column: Code Editor & AI Review Card */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md bg-slate-950 flex flex-col">
                {/* Editor Header */}
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Python 3 · Solution Workspace</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Press Tab to indent</span>
                </div>

                {/* Editor Textarea */}
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const target = e.target as HTMLTextAreaElement;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const updated = userCode.substring(0, start) + "    " + userCode.substring(end);
                      setUserCode(updated);
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = start + 4;
                      }, 0);
                    }
                  }}
                  spellCheck={false}
                  rows={16}
                  className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 focus:outline-hidden leading-relaxed resize-y border-none"
                  placeholder="# Write your implementation here..."
                />

                {/* Editor Footer / Submit Bar */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Lines: {userCode.split("\n").length}
                  </span>
                  <Button
                    onClick={submitChallenge}
                    disabled={evaluatingCode || !userCode.trim()}
                    className="gap-2 bg-primary hover:bg-primary/90 text-white font-medium text-xs h-9 px-4"
                  >
                    {evaluatingCode ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Evaluating with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Run & Submit for AI Review</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* AI Code Review Results Card */}
              {evaluationResult && (
                <Card className={`border shadow-sm transition-all ${
                  evaluationResult.passed 
                    ? "border-emerald-200 bg-emerald-50/20" 
                    : "border-amber-200 bg-amber-50/20"
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {evaluationResult.passed ? (
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900">
                            AI Code Evaluation Review
                          </CardTitle>
                          <p className="text-xs text-slate-500">
                            Evaluated against logic accuracy, edge cases, and Big-O efficiency
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-2xl font-black ${
                          evaluationResult.score >= 80 
                            ? "text-emerald-600" 
                            : evaluationResult.score >= 60 
                            ? "text-amber-600" 
                            : "text-rose-600"
                        }`}>
                          {evaluationResult.score}/100
                        </span>
                        <div className="text-[10px] font-semibold tracking-wide uppercase text-slate-500">
                          {evaluationResult.passed ? "PASSED" : "NEEDS WORK"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 text-xs sm:text-sm">
                    {/* Summary */}
                    <p className="p-3 rounded-lg bg-white border border-slate-200/80 text-slate-700 leading-relaxed font-normal">
                      {evaluationResult.summary}
                    </p>

                    {/* Strengths & Improvement in 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 space-y-1.5">
                        <span className="font-semibold text-emerald-900 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Strengths:
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {evaluationResult.strengths.map((s, idx) => (
                            <li key={idx} className="leading-snug">• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 space-y-1.5">
                        <span className="font-semibold text-amber-900 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Opportunities:
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {evaluationResult.areas_for_improvement.map((tip, idx) => (
                            <li key={idx} className="leading-snug">• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Efficiency & Big-O Analysis */}
                    {evaluationResult.efficiency_analysis && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-800">Big-O Efficiency: </span>
                        <span className="text-slate-600">{evaluationResult.efficiency_analysis}</span>
                      </div>
                    )}

                    {/* Edge Cases Analysis */}
                    {evaluationResult.edge_cases_analyzed && evaluationResult.edge_cases_analyzed.length > 0 && (
                      <div className="space-y-1.5 text-xs">
                        <span className="font-semibold text-slate-800">Edge Case Verification:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {evaluationResult.edge_cases_analyzed.map((ec, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-white border border-slate-200">
                              <span className="truncate mr-2 text-slate-700">{ec.case}</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${
                                ec.handled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}>
                                {ec.handled ? "Handled" : "Missed"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mastery Boost Notification */}
                    {evaluationResult.mastery_updated && evaluationResult.new_mastery !== undefined && (
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-900">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Trophy className="h-4 w-4 text-purple-600" />
                          Topic Mastery Boosted to {evaluationResult.new_mastery}%!
                        </span>
                        <Badge className="bg-purple-600 text-white text-[10px]">Updated</Badge>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startChallenge()}
                      className="text-xs"
                    >
                      Try Another Challenge
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2B. Challenge Configuration View (When no challenge is active)
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <ModeSwitcher />

        <div className="text-center space-y-2">
          <div className="inline-flex rounded-full bg-indigo-50 p-4 mb-1">
            <Code2 className="h-9 w-9 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Code Challenge & Weak-Topic Lab
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-sm">
            AI-generated coding exercises and technical interview challenges targeted specifically to the weak sub-concepts you struggled with in quizzes.
          </p>
        </div>

        {/* Diagnostic Radar for Weak Concepts */}
        {weakSummary?.weak_concepts && weakSummary.weak_concepts.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                    Weak-Concept Diagnostic Radar
                  </h3>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
                    Auto-Detected from Quizzes
                  </Badge>
                </div>
                <p className="text-xs text-purple-800">
                  Click any detected weak spot below to instantly build a challenge designed to conquer it:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {weakSummary.weak_concepts.map((concept, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setConceptFocus(concept);
                        startChallenge(concept);
                      }}
                      className="text-xs px-2.5 py-1 rounded-md bg-white border border-purple-200 text-purple-900 font-medium hover:bg-purple-100 hover:border-purple-300 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>{concept}</span>
                      <ArrowRight className="h-3 w-3 text-purple-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Configuration Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Configure Challenge</CardTitle>
            <CardDescription>
              Choose your focus topic, difficulty, and format for this coding session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Challenge Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChallengeType("code")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    challengeType === "code"
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-slate-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Code2 className="h-4 w-4 text-indigo-600" />
                    <span>Coding Exercise</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Executable functions, test cases, and edge-case handling.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setChallengeType("interview")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    challengeType === "interview"
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-slate-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Terminal className="h-4 w-4 text-indigo-600" />
                    <span>Technical Interview</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Big-O complexity, architectural trade-offs, and scalability.
                  </p>
                </button>
              </div>
            </div>

            {/* Topic Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Topic
              </label>
              {topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {topics.map((t) => {
                    const isSelected = t.id === selectedTopicId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTopicId(t.id)}
                        className={`text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary text-slate-900 font-medium"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="truncate">{t.name}</p>
                          <span className="text-[10px] text-slate-400 capitalize">{t.status?.replace("_", " ") || "available"}</span>
                        </div>
                        {t.mastery !== undefined && (
                          <Badge variant="secondary" className="text-[10px] shrink-0 font-mono">
                            {t.mastery.toFixed(0)}%
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Loading topics...</p>
              )}
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as const).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-3 rounded-lg border text-center text-xs font-medium capitalize transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              size="lg"
              onClick={() => startChallenge()}
              disabled={challengeLoading || topics.length === 0}
              className="w-full font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {challengeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{challengeLoadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI Challenge for {activeTopic?.name || "Topic"}</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {challengeLoading && (
          <div className="p-6 rounded-xl bg-indigo-50/60 border border-indigo-200 text-center space-y-3 animate-pulse">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
            <p className="font-medium text-slate-800 text-sm">{challengeLoadingStep}</p>
            <p className="text-xs text-slate-500">Retrieving syllabus context and synthesizing practical challenge...</p>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: ADAPTIVE MCQ QUIZ
  // ==========================================

  // 1. Initial State: Topic & Difficulty Selection
  if (!quiz && !result) {
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <ModeSwitcher />

        <div className="text-center space-y-2">
          <div className="inline-flex rounded-full bg-primary/10 p-4 mb-1">
            <Target className="h-9 w-9 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Adaptive Practice Session</h1>
          <p className="text-slate-500 max-w-lg mx-auto text-sm">
            Dynamic questions formulated by AI based on your uploaded PDFs, current mastery band, and target goals.
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Configure Session</CardTitle>
            <CardDescription>Select which topic and challenge level you want to practice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Topic</label>
              {topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {topics.map((t) => {
                    const isSelected = t.id === selectedTopicId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTopicId(t.id)}
                        className={`text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary text-slate-900 font-medium"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="truncate">{t.name}</p>
                          <span className="text-[10px] text-slate-400 capitalize">{t.status?.replace("_", " ") || "available"}</span>
                        </div>
                        {t.mastery !== undefined && (
                          <Badge variant="secondary" className="text-[10px] shrink-0 font-mono">
                            {t.mastery.toFixed(0)}%
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Loading topics...</p>
              )}
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as const).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-3 rounded-lg border text-center text-xs font-medium capitalize transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={startQuiz}
              disabled={loading || topics.length === 0}
              className="w-full sm:w-auto flex-1 font-semibold text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start {activeTopic?.name || "Practice"} Quiz
                </>
              )}
            </Button>
            <Link href="/path">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm">
                <BookOpen className="mr-2 h-4 w-4" /> View Path
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {loading && (
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-3 animate-pulse">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="font-medium text-slate-800 text-sm">{loadingStep}</p>
            <p className="text-xs text-slate-500">Tailoring quiz questions with RAG vector retrieval...</p>
          </div>
        )}
      </div>
    );
  }

  // 2. Quiz Results & Mastery Delta State
  if (result) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <ModeSwitcher />

        <div className="text-center mb-6 space-y-2">
          <Badge className="capitalize text-xs font-semibold px-3 py-1 bg-primary/10 text-primary border-primary/20">
            {result.topic} • {result.difficulty}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Practice Session Complete!</h2>
          <p className="text-slate-500 text-base">
            You scored <span className="font-bold text-slate-900">{result.score.toFixed(0)}%</span> ({result.correct_count}/{result.total_questions} correct)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-5 w-5 text-yellow-500" /> Mastery Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{result.topic} Mastery</span>
                <span className={`text-sm font-bold ${result.mastery_delta >= 0 ? "text-green-600" : "text-amber-600"}`}>
                  {result.mastery_delta >= 0 ? `+${result.mastery_delta.toFixed(1)}%` : `${result.mastery_delta.toFixed(1)}%`}
                </span>
              </div>
              <Progress value={result.mastery_after} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Before: {result.mastery_before.toFixed(1)}% ({result.band_before})</span>
                <span className="font-semibold text-slate-700">Now: {result.mastery_after.toFixed(1)}% ({result.band_after})</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-primary" /> Adaptive Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium text-slate-800 leading-relaxed">{result.next_action.reason}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="capitalize text-xs">{result.next_action.action_type.replace("_", " ")}</Badge>
                {result.weak_concepts && result.weak_concepts.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 h-7 px-2.5"
                    onClick={() => {
                      setSelectedTopicId(result.topic_id);
                      setConceptFocus(result.weak_concepts[0]);
                      setActiveTab("challenge");
                      setResult(null);
                      setQuiz(null);
                    }}
                  >
                    <Zap className="h-3 w-3 text-yellow-300" />
                    <span>Conquer "{result.weak_concepts[0]}" in Code Lab</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Path Changes Banner */}
        {result.path_changed && result.path_changes && result.path_changes.length > 0 && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-purple-900">Your Learning Path has been updated!</h4>
              {result.path_changes.map((change, idx) => (
                <p key={idx} className="text-xs text-purple-700 mt-1">
                  • <strong>{change.topic}</strong> changed from <em>{change.from}</em> to <strong>{change.to}</strong>: {change.reason}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Question Review */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Question Review & Explanations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.review.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${item.is_correct ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-slate-800">Q{idx + 1}. {item.question}</span>
                  {item.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3">
                  <div className={`p-2 rounded ${item.is_correct ? "bg-green-100/60 text-green-900 font-medium" : "bg-red-100/60 text-red-900"}`}>
                    Your answer: {item.your_answer}
                  </div>
                  {!item.is_correct && (
                    <div className="p-2 rounded bg-green-100/60 text-green-900 font-medium">
                      Correct answer: {item.correct_answer}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded border border-slate-200/60">
                  <span className="font-semibold">Explanation: </span>{item.explanation}
                </p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setQuiz(null);
              }}
            >
              Practice Another Topic
            </Button>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. Quiz Taking Question-by-Question State
  const q = quiz!.questions[currentQuestionIdx];
  const progressPct = ((currentQuestionIdx + 1) / quiz!.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <ModeSwitcher />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{quiz!.topic}</span>
        <span>Question {currentQuestionIdx + 1} of {quiz!.questions.length}</span>
      </div>
      <Progress value={progressPct} className="h-2" />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs capitalize">{q.difficulty}</Badge>
            {q.concept_tag && <Badge variant="secondary" className="text-xs">{q.concept_tag}</Badge>}
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900 leading-snug">
            {q.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, optIdx) => {
            const isSelected = answers[q.id] === optIdx;
            const isCorrect = q.correct_index === optIdx;

            let btnStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800";
            if (showAnswer) {
              if (isCorrect) {
                btnStyle = "border-green-500 bg-green-50 text-green-900 font-semibold ring-1 ring-green-500";
              } else if (isSelected) {
                btnStyle = "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500";
              } else {
                btnStyle = "border-slate-100 text-slate-400 opacity-60";
              }
            } else if (isSelected) {
              btnStyle = "border-primary bg-primary/5 text-primary ring-2 ring-primary font-medium";
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={showAnswer}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {showAnswer && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 ml-2" />}
                {showAnswer && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600 shrink-0 ml-2" />}
              </button>
            );
          })}

          {showAnswer && (
            <div className="mt-4 p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <span className="font-semibold">Explanation:</span>
              <p className="leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          {!showAnswer ? (
            <Button onClick={() => setShowAnswer(true)} disabled={answers[q.id] === undefined}>
              Check Answer
            </Button>
          ) : currentQuestionIdx < quiz!.questions.length - 1 ? (
            <Button
              onClick={() => {
                setShowAnswer(false);
                setCurrentQuestionIdx((i) => i + 1);
              }}
            >
              Next Question <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submitQuiz} disabled={loading} className="font-semibold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Quiz & Update Mastery"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
