"use client";

import { useState, useEffect } from "react";
import { Loader2, Target, Trophy, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { fetchApi } from "@/lib";
import { QuizGenerateResponse, QuizQuestion, QuizSubmitResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function PracticePage() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizGenerateResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setShowAnswer(false);
    
    try {
      const data = await fetchApi<QuizGenerateResponse>("/api/quiz/generate", {
        method: "POST",
        body: JSON.stringify({ topic_id: 1, difficulty: "medium" }), // hardcoded topic_id 1 (Variables) for demo
      });
      setQuiz(data);
    } catch (err) {
      alert("Failed to generate quiz. Make sure Gemini API is working and you are onboarded.");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    setLoading(true);
    try {
      const data = await fetchApi<QuizSubmitResponse>(`/api/quiz/${quiz.attempt_id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(data);
    } catch (err) {
      alert("Failed to submit quiz.");
    } finally {
      setLoading(false);
    }
  };

  if (!quiz && !result) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Target className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Adaptive Practice</h1>
        <p className="text-lg text-slate-500 max-w-md mb-8">
          The AI will generate a dynamic quiz tailored exactly to your current mastery level and weaknesses.
        </p>
        <Button size="lg" onClick={startQuiz} disabled={loading} className="px-8">
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Quiz...</> : "Start Practice Session"}
        </Button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Practice Complete!</h2>
          <p className="text-slate-500">You scored {result.score.toFixed(0)}% ({result.correct_count}/{result.total_questions})</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500"/> Mastery Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Topic Mastery</span>
                <span className="text-sm font-bold text-green-600">+{result.mastery_delta.toFixed(1)}%</span>
              </div>
              <Progress value={result.mastery_after} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Before: {result.mastery_before.toFixed(1)}%</span>
                <span>Now: {result.mastery_after.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Next Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{result.next_action.reason}</p>
              <Badge className="mt-2 capitalize">{result.next_action.action_type.replace('_', ' ')}</Badge>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-bold mb-4">Review</h3>
        <div className="space-y-4">
          {result.review.map((r, i) => (
            <Card key={i} className={r.is_correct ? "border-green-200" : "border-red-200"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium">Q{i+1}. {r.question}</span>
                  {r.is_correct ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="p-3 rounded bg-slate-50">
                  <p><span className="font-medium text-slate-500">Your Answer:</span> {r.your_answer}</p>
                  {!r.is_correct && <p className="mt-1"><span className="font-medium text-slate-500">Correct Answer:</span> {r.correct_answer}</p>}
                </div>
                <p className="text-slate-600"><span className="font-medium">Explanation:</span> {r.explanation}</p>
                <Badge variant="outline" className="mt-2">{r.concept_tag}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <Button onClick={() => setResult(null)} variant="outline">Back to Practice Home</Button>
        </div>
      </div>
    );
  }

  const q = quiz!.questions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{quiz?.topic} Practice</h2>
        <Badge variant="outline" className="capitalize">{quiz?.difficulty}</Badge>
      </div>
      
      <Progress value={((currentQuestionIdx) / quiz!.questions.length) * 100} className="h-2" />
      
      <Card>
        <CardHeader>
          <CardDescription>Question {currentQuestionIdx + 1} of {quiz!.questions.length}</CardDescription>
          <CardTitle className="text-xl leading-relaxed">{q.question}</CardTitle>
          <div className="pt-2">
             <Badge variant="secondary" className="text-xs">{q.concept_tag}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, i) => {
            const isSelected = answers[q.id] === i;
            const isCorrect = q.correct_index === i;
            
            let buttonClass = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
            if (showAnswer) {
              if (isCorrect) {
                buttonClass = "border-green-500 bg-green-50 ring-1 ring-green-500 text-green-900";
              } else if (isSelected) {
                buttonClass = "border-red-500 bg-red-50 ring-1 ring-red-500 text-red-900";
              } else {
                buttonClass = "border-slate-200 opacity-50";
              }
            } else if (isSelected) {
              buttonClass = "border-primary bg-primary/5 ring-1 ring-primary";
            }

            return (
              <button
                key={i}
                onClick={() => !showAnswer && setAnswers({...answers, [q.id]: i})}
                disabled={showAnswer}
                className={`w-full text-left p-4 rounded-lg border transition-all ${buttonClass}`}
              >
                {opt}
              </button>
            );
          })}
          
          {showAnswer && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-medium flex items-center gap-2 mb-1">
                {answers[q.id] === q.correct_index ? (
                  <><CheckCircle2 className="h-5 w-5 text-green-500" /> Correct!</>
                ) : (
                  <><XCircle className="h-5 w-5 text-red-500" /> Incorrect</>
                )}
              </p>
              <p className="text-slate-600 text-sm mt-2"><span className="font-medium text-slate-900">Explanation:</span> {q.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          {!showAnswer ? (
            <Button 
              onClick={() => setShowAnswer(true)} 
              disabled={answers[q.id] === undefined}
            >
              Check Answer
            </Button>
          ) : currentQuestionIdx < quiz!.questions.length - 1 ? (
            <Button 
              onClick={() => {
                setShowAnswer(false);
                setCurrentQuestionIdx(i => i + 1);
              }} 
            >
              Next Question <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={submitQuiz}
              disabled={loading}
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Quiz"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
