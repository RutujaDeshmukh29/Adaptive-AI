"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Code2, Terminal, Zap, Lightbulb, CheckCircle2, XCircle, 
  RotateCcw, Sparkles, ArrowRight, ArrowLeft, ArrowUp, 
  AlertCircle, BookOpen, Check, Loader2, Award, ChevronRight,
  ShieldCheck, HelpCircle, Layers, FileCode
} from "lucide-react";
import { fetchApi } from "@/lib";
import { 
  Challenge, ChallengeEvaluation, WeakTopicsSummary 
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";

interface TopicOption {
  id: number;
  name: string;
  status?: string;
  mastery?: number;
}

const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python", ext: "py", boilerplate: "# Write your Python solution below\n\ndef solution(*args, **kwargs):\n    # TODO: Implement your solution here\n    pass\n" },
  { id: "javascript", name: "JavaScript", ext: "js", boilerplate: "// Write your JavaScript solution below\n\nfunction solution(...args) {\n    // TODO: Implement your solution here\n}\n\nmodule.exports = { solution };\n" },
  { id: "typescript", name: "TypeScript", ext: "ts", boilerplate: "// Write your TypeScript solution below\n\nfunction solution(...args: any[]): any {\n    // TODO: Implement your solution here\n}\n\nexport { solution };\n" },
  { id: "java", name: "Java", ext: "java", boilerplate: "// Write your Java solution below\n\npublic class Solution {\n    public static Object solve(Object... args) {\n        // TODO: Implement your solution here\n        return null;\n    }\n}\n" },
  { id: "cpp", name: "C++", ext: "cpp", boilerplate: "// Write your C++ solution below\n#include <iostream>\n#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    void solve() {\n        // TODO: Implement your solution here\n    }\n};\n" },
  { id: "go", name: "Go", ext: "go", boilerplate: "// Write your Go solution below\npackage main\n\nfunc solution() {\n    // TODO: Implement your solution here\n}\n" },
];

function ChallengesContent() {
  const searchParams = useSearchParams();
  const queryTopicId = searchParams.get("topic_id");
  const queryConcept = searchParams.get("concept");

  // Topics & Configuration
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [challengeType, setChallengeType] = useState<"code" | "interview">("code");
  const [conceptFocus, setConceptFocus] = useState<string>(queryConcept || "");

  // Diagnostic Weak Topics
  const [weakSummary, setWeakSummary] = useState<WeakTopicsSummary | null>(null);

  // Active Challenge State
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState<string>("");
  const [challengeLoading, setChallengeLoading] = useState<boolean>(false);
  const [challengeLoadingStep, setChallengeLoadingStep] = useState<string>("Synthesizing targeted challenge...");
  const [unlockedHints, setUnlockedHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [evaluatingCode, setEvaluatingCode] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<ChallengeEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Floating Back to Top
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

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

  // Auto-launch if concept passed via query
  useEffect(() => {
    if (queryConcept && topics.length > 0 && !challenge && !challengeLoading) {
      startChallenge(queryConcept);
    }
  }, [queryConcept, topics]);

  // --- Handlers ---
  const startChallenge = async (customFocus?: string, customLang?: string) => {
    setChallengeLoading(true);
    setErrorMessage(null);
    setEvaluationResult(null);
    setUnlockedHints(0);
    setShowSolution(false);
    setChallengeLoadingStep("Analyzing your weak sub-concepts and uploaded notes...");

    const langToUse = customLang || selectedLanguage;
    const focusToUse = customFocus !== undefined ? customFocus : (conceptFocus.trim() || undefined);

    const stepTimer = setTimeout(() => {
      setChallengeLoadingStep(`Generating ${langToUse.toUpperCase()} problem and automated test assertions...`);
    }, 1800);

    try {
      const data = await fetchApi<Challenge>("/api/challenge/generate", {
        method: "POST",
        body: JSON.stringify({
          topic_id: selectedTopicId,
          difficulty: selectedDifficulty,
          type: challengeType,
          concept_focus: focusToUse,
          language: langToUse,
        }),
      });
      setChallenge(data);
      setUserCode(data.starter_code || "");
    } catch (err: any) {
      setErrorMessage(err.detail || "Failed to generate coding challenge. Please try again.");
    } finally {
      clearTimeout(stepTimer);
      setChallengeLoading(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    const langObj = SUPPORTED_LANGUAGES.find(l => l.id === newLang);
    if (challenge && langObj) {
      // If challenge already loaded, user can switch starter template or restart
      if (confirm(`Switch coding environment to ${langObj.name}? This will reset your current code editor to the ${langObj.name} template.`)) {
        setUserCode(langObj.boilerplate);
      }
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
          language: selectedLanguage,
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

  // ==========================================
  // VIEW 1: ACTIVE LIVE CODING WORKSPACE
  // ==========================================
  if (challenge) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
        {/* Workspace Top Header */}
        <ScrollReveal pop={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Exit this coding challenge session?")) {
                    setChallenge(null);
                    setEvaluationResult(null);
                  }
                }}
                className="h-9 gap-1.5 text-xs font-medium border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Challenges
              </Button>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{challenge.title}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {challenge.topic_name}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize font-medium ${
                      challenge.difficulty === "easy" 
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800" 
                        : challenge.difficulty === "hard" 
                        ? "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800" 
                        : "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                    }`}
                  >
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    Focus: {challenge.targeted_weakness}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserCode(challenge.starter_code)}
                className="text-xs gap-1.5 h-9 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title="Reset code to original starter template"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Code
              </Button>
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

        {/* Two-Column Engineering Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Problem, Requirements, Test Cases & Progressive Hints */}
          <div className="lg:col-span-5 space-y-4">
            {/* Scenario & Problem Description */}
            <ScrollReveal pop={true}>
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Terminal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Problem Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 font-normal">
                    {challenge.scenario}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Requirements & Constraints:
                    </h4>
                    <ul className="space-y-2">
                      {challenge.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Sample Test Cases */}
            <ScrollReveal delay={100} pop={true}>
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Sample Test Cases & Assertions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {challenge.test_cases.map((tc, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1 font-mono">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Case #{i + 1}</span>
                        {tc.explanation && <span className="font-sans text-slate-400">{tc.explanation}</span>}
                      </div>
                      <div className="text-slate-800 dark:text-slate-200">
                        <span className="text-slate-400 font-sans">Input: </span>
                        {tc.input}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        <span className="text-slate-400 font-sans">Expected: </span>
                        {tc.expected}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Progressive Hints Accordion */}
            <ScrollReveal delay={150} pop={true}>
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Progressive Hints ({unlockedHints}/{challenge.hints.length})
                  </CardTitle>
                  {unlockedHints < challenge.hints.length && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUnlockedHints((prev) => prev + 1)}
                      className="h-7 text-xs text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      Unlock Hint {unlockedHints + 1}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {unlockedHints === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Stuck? Click "Unlock Hint" for progressive guidance without giving away the full solution.
                    </p>
                  ) : (
                    challenge.hints.slice(0, unlockedHints).map((h, i) => (
                      <div key={i} className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                        <span className="font-bold text-amber-800 dark:text-amber-300 mr-1.5">Hint {i + 1}:</span>
                        {h}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Reference Solution Reveal */}
            <ScrollReveal delay={200} pop={true}>
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    Reference Solution & Big-O
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSolution((prev) => !prev)}
                    className="h-7 text-xs text-slate-600 dark:text-slate-400"
                  >
                    {showSolution ? "Hide Solution" : "Reveal Solution"}
                  </Button>
                </CardHeader>
                {showSolution && (
                  <CardContent className="space-y-3 pt-2 text-xs">
                    <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                      <code>{challenge.solution}</code>
                    </pre>
                    <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200 leading-relaxed">
                      <span className="font-bold">Algorithmic Derivation: </span>
                      {challenge.explanation}
                    </div>
                  </CardContent>
                )}
              </Card>
            </ScrollReveal>
          </div>

          {/* Right Column: Code Editor & AI Evaluation Panel */}
          <div className="lg:col-span-7 space-y-4">
            {/* Code Editor Card */}
            <ScrollReveal pop={true}>
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                {/* Language Bar & Tabs */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Editor ({selectedLanguage.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                          selectedLanguage === lang.id
                            ? "bg-indigo-600 text-white shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Surface */}
                <CardContent className="p-0">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={17}
                    spellCheck={false}
                    className="w-full font-mono text-xs sm:text-sm p-4 bg-slate-950 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 border-none resize-y selection:bg-indigo-600 selection:text-white leading-relaxed"
                    placeholder={`// Write your ${selectedLanguage} code here...`}
                  />
                </CardContent>

                <CardFooter className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    Evaluated against test cases, edge cases, and Big-O efficiency
                  </span>
                  <Button
                    onClick={submitChallenge}
                    disabled={evaluatingCode || !userCode.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-2.5 h-10 gap-2 shadow-xs"
                  >
                    {evaluatingCode ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Evaluating Solution...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Submit for AI Evaluation</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </ScrollReveal>

            {/* AI Evaluation Results Panel */}
            {evaluationResult && (
              <ScrollReveal pop={true}>
                <Card className={`border shadow-sm rounded-2xl overflow-hidden ${
                  evaluationResult.passed 
                    ? "border-emerald-200/80 bg-white dark:bg-slate-900" 
                    : "border-amber-200/80 bg-white dark:bg-slate-900"
                }`}>
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {evaluationResult.passed ? (
                          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                            {evaluationResult.passed ? "Challenge Completed!" : "Needs Refinement"}
                          </CardTitle>
                          <p className="text-xs text-slate-500">
                            AI Senior Technical Reviewer Assessment
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xl font-black ${
                          evaluationResult.score >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}>
                          {evaluationResult.score}/100
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4 text-xs sm:text-sm">
                    {/* Summary */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {evaluationResult.summary}
                    </div>

                    {/* Strengths & Improvement Grid */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 space-y-2">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" /> Strengths
                        </span>
                        <ul className="space-y-1 text-emerald-800 dark:text-emerald-200">
                          {evaluationResult.strengths.map((str, i) => (
                            <li key={i}>• {str}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 space-y-2">
                        <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5" /> Areas for Improvement
                        </span>
                        <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                          {evaluationResult.areas_for_improvement.map((area, i) => (
                            <li key={i}>• {area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Algorithmic Efficiency & Big-O */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300">Algorithmic Efficiency & Big-O:</span>
                      <p className="leading-relaxed">{evaluationResult.efficiency_analysis}</p>
                    </div>

                    {/* Edge Cases Analysis */}
                    {evaluationResult.edge_cases_analyzed && evaluationResult.edge_cases_analyzed.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Edge Case Validation:
                        </span>
                        <div className="space-y-1.5">
                          {evaluationResult.edge_cases_analyzed.map((ec, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                              <span className="text-slate-700 dark:text-slate-300">{ec.case}</span>
                              <span className={`font-semibold flex items-center gap-1 ${
                                ec.handled ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              }`}>
                                {ec.handled ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {ec.handled ? "Handled" : "Missed"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startChallenge()}
                      className="text-xs"
                    >
                      Try Another Challenge
                    </Button>
                    <Link href="/practice">
                      <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                        Return to Adaptive Quizzes
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: CHALLENGE CONFIGURATION & WEAK-TOPIC RADAR
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 pb-16">
      {/* Title & Introduction */}
      <ScrollReveal pop={false}>
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 p-3.5 mb-1 border border-indigo-100 dark:border-indigo-900">
            <Code2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Coding Challenges & Weak-Topic Lab
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            AI-engineered coding exercises and technical interview problems calibrated specifically to the weak concepts you encountered during quizzes.
          </p>
        </div>
      </ScrollReveal>

      {/* Diagnostic Radar for Weak Concepts */}
      {weakSummary?.weak_concepts && weakSummary.weak_concepts.length > 0 && (
        <ScrollReveal delay={100} pop={true}>
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border border-purple-200/80 dark:border-purple-900/60 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5 shadow-sm">
                <Zap className="h-5 w-5 text-yellow-300" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                    Weak-Concept Diagnostic Radar
                  </h3>
                  <Badge className="bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px]">
                    Auto-Detected from Quiz Trajectory
                  </Badge>
                </div>
                <p className="text-xs text-purple-900 dark:text-purple-300 leading-relaxed">
                  Click any detected weak spot below to immediately calibrate a targeted challenge:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {weakSummary.weak_concepts.map((concept, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setConceptFocus(concept);
                        startChallenge(concept);
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 font-semibold hover:bg-purple-100 dark:hover:bg-purple-950 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>{concept}</span>
                      <ArrowRight className="h-3 w-3 text-purple-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {errorMessage && (
        <ScrollReveal pop={true}>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </ScrollReveal>
      )}

      {/* Main Configuration Card */}
      <ScrollReveal delay={150} pop={true}>
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Configure Coding Session
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose your language, format, focus topic, and difficulty level.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
            {/* Programming Language Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Target Programming Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-white font-bold ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-sm font-bold">{lang.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">.{lang.ext}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Challenge Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChallengeType("code")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    challengeType === "code"
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-950 dark:text-indigo-200">
                    <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Algorithmic Coding Exercise</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Executable functions, test cases, and edge-case validation.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setChallengeType("interview")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    challengeType === "interview"
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-950 dark:text-indigo-200">
                    <Terminal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Technical Interview Scenario</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    System trade-offs, Big-O complexity, and optimal architectures.
                  </p>
                </button>
              </div>
            </div>

            {/* Topic Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Topic
              </label>
              {topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {topics.map((t) => {
                    const isSelected = t.id === selectedTopicId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTopicId(t.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 ring-1 ring-indigo-600 text-indigo-950 dark:text-white font-bold"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="truncate font-medium">{t.name}</p>
                          <span className="text-[10px] text-slate-400 capitalize">{t.status?.replace("_", " ") || "Available"}</span>
                        </div>
                        {t.mastery !== undefined && t.mastery !== null && (
                          <Badge variant="secondary" className="text-[10px] shrink-0 font-mono">
                            {Number(t.mastery).toFixed(0)}%
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
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(["easy", "medium", "hard"] as const).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold capitalize transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-6 sm:p-8 pt-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
            <Button
              size="lg"
              onClick={() => startChallenge()}
              disabled={challengeLoading || topics.length === 0}
              className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2.5 h-12 rounded-xl text-sm sm:text-base shadow-sm shadow-indigo-600/25 cursor-pointer"
            >
              {challengeLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{challengeLoadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate {selectedLanguage.toUpperCase()} Challenge for {activeTopic?.name || "Selected Topic"}</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </ScrollReveal>

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

export default function ChallengesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      }
    >
      <ChallengesContent />
    </Suspense>
  );
}
