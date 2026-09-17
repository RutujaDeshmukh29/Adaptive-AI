"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Target, Trophy, ArrowRight, CheckCircle2, XCircle, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { fetchApi } from "@/lib";
import { QuizGenerateResponse, QuizSubmitResponse } from "@/lib/types";
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

  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Preparing your adaptive session...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<QuizGenerateResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

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

  // 1. Initial State: Topic & Difficulty Selection
  if (!quiz && !result) {
    const activeTopic = topics.find((t) => t.id === selectedTopicId);

    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex rounded-full bg-primary/10 p-5 mb-2">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Adaptive Practice Session</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
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
            <CardTitle className="text-xl">Configure Session</CardTitle>
            <CardDescription>Select which topic and challenge level you want to practice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Topic</label>
              {topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {topics.map((t) => {
                    const isSelected = t.id === selectedTopicId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTopicId(t.id)}
                        className={`text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary text-slate-900"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="font-medium text-sm truncate">{t.name}</p>
                          <span className="text-xs text-slate-400 capitalize">{t.status?.replace("_", " ") || "available"}</span>
                        </div>
                        {t.mastery !== undefined && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {t.mastery.toFixed(0)}%
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 text-sm text-slate-500 bg-slate-50 rounded-lg border">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading topics...
                </div>
              )}
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Challenge Level</label>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "medium", "hard"] as const).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-3 rounded-lg border text-center font-medium capitalize transition-all ${
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
              className="w-full sm:w-auto flex-1 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start {activeTopic?.name || "Practice"} Quiz
                </>
              )}
            </Button>
            <Link href="/path">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
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
      <div className="space-y-8 max-w-4xl mx-auto py-4">
        <div className="text-center mb-8 space-y-2">
          <Badge className="capitalize text-xs font-semibold px-3 py-1 bg-primary/10 text-primary border-primary/20">
            {result.topic} • {result.difficulty}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Practice Session Complete!</h2>
          <p className="text-slate-500 text-lg">
            You scored <span className="font-bold text-slate-900">{result.score.toFixed(0)}%</span> ({result.correct_count}/{result.total_questions} correct)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" /> Adaptive Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium text-slate-800 leading-relaxed">{result.next_action.reason}</p>
              <div className="flex items-center gap-2">
                <Badge className="capitalize text-xs">{result.next_action.action_type.replace("_", " ")}</Badge>
                {result.weak_concepts && result.weak_concepts.length > 0 && (
                  <span className="text-xs text-slate-500">
                    Concepts to review: <span className="text-red-600 font-medium">{result.weak_concepts.join(", ")}</span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Question Review</h3>
        <div className="space-y-4">
          {result.review.map((r, i) => (
            <Card key={i} className={`border ${r.is_correct ? "border-green-200 bg-white" : "border-red-200 bg-white"}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="font-medium text-slate-900">
                    Q{i + 1}. {r.question}
                  </span>
                  {r.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <p>
                    <span className="font-medium text-slate-500">Your Answer:</span>{" "}
                    <span className={r.is_correct ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{r.your_answer}</span>
                  </p>
                  {!r.is_correct && (
                    <p>
                      <span className="font-medium text-slate-500">Correct Answer:</span>{" "}
                      <span className="text-green-700 font-semibold">{r.correct_answer}</span>
                    </p>
                  )}
                </div>
                <p className="text-slate-600">
                  <span className="font-medium text-slate-900">Explanation:</span> {r.explanation}
                </p>
                <Badge variant="outline" className="text-xs">
                  {r.concept_tag}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Button onClick={() => setResult(null)} variant="default">
            Practice Another Topic
          </Button>
          <Link href="/path">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" /> Back to Learning Path
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">View Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. In-Quiz Question State
  const q = quiz!.questions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{quiz?.topic} Practice</h2>
          <p className="text-xs text-slate-500 mt-0.5">{quiz?.selection_reason}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {quiz?.difficulty}
        </Badge>
      </div>

      <Progress value={((currentQuestionIdx + 1) / quiz!.questions.length) * 100} className="h-2" />

      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardDescription>
            Question {currentQuestionIdx + 1} of {quiz!.questions.length}
          </CardDescription>
          <CardTitle className="text-xl leading-relaxed">{q.question}</CardTitle>
          <div className="pt-2">
            <Badge variant="secondary" className="text-xs">
              {q.concept_tag}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, i) => {
            const isSelected = answers[q.id] === i;
            const isCorrect = q.correct_index === i;

            let buttonClass = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
            if (showAnswer) {
              if (isCorrect) {
                buttonClass = "border-green-500 bg-green-50 ring-1 ring-green-500 text-green-900 font-medium";
              } else if (isSelected) {
                buttonClass = "border-red-500 bg-red-50 ring-1 ring-red-500 text-red-900 font-medium";
              } else {
                buttonClass = "border-slate-200 opacity-50";
              }
            } else if (isSelected) {
              buttonClass = "border-primary bg-primary/5 ring-1 ring-primary font-medium";
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => !showAnswer && setAnswers({ ...answers, [q.id]: i })}
                disabled={showAnswer}
                className={`w-full text-left p-4 rounded-lg border transition-all ${buttonClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}

          {showAnswer && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                {answers[q.id] === q.correct_index ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-700">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">Incorrect</span>
                  </>
                )}
              </p>
              <p className="text-slate-600 text-sm">
                <span className="font-medium text-slate-900">Explanation:</span> {q.explanation}
              </p>
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
