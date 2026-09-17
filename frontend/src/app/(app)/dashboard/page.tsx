"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib";
import { LearnerSnapshot, TopicMastery } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, BrainCircuit, TrendingUp, Trophy, Target, AlertCircle, BookOpen, PenTool } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi<LearnerSnapshot>("/api/profile");
        setSnapshot(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!snapshot) {
    return <div>Failed to load profile. Please try reloading or signing in again.</div>;
  }

  const getBandColor = (band: string) => {
    switch(band) {
      case "mastered": return "bg-green-500";
      case "competent": return "bg-blue-500";
      case "developing": return "bg-yellow-500";
      default: return "bg-red-500";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {snapshot.user.name}</h1>
          <p className="mt-2 text-slate-500 flex items-center gap-2">
            <Target className="h-4 w-4" /> Goal: <span className="font-medium text-slate-900">{snapshot.goal}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/materials">
            <Button variant="outline"><BookOpen className="h-4 w-4 mr-2" /> Materials</Button>
          </Link>
          <Link href="/practice">
            <Button><PenTool className="h-4 w-4 mr-2" /> Practice</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Overall Mastery</CardTitle>
            <CardDescription>Your current proficiency across all {snapshot.subject} topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-5xl font-extrabold text-slate-900">{snapshot.overall_mastery.toFixed(1)}%</span>
              <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                snapshot.recent_trend === 'improving' ? 'bg-green-100 text-green-700' :
                snapshot.recent_trend === 'declining' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {snapshot.recent_trend === 'improving' ? <TrendingUp className="h-3 w-3" /> : null}
                {snapshot.recent_trend}
              </span>
            </div>
            <Progress value={snapshot.overall_mastery} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Quizzes Taken</span>
              <span className="font-bold">{snapshot.total_quizzes}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500">Day Streak</span>
              <span className="font-bold">{snapshot.streak_days} 🔥</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">PDFs Uploaded</span>
              <span className="font-bold">{snapshot.materials_count}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Strengths & Weaknesses</CardTitle>
            <CardDescription>What you know well and what needs work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Strong Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {snapshot.strengths.length > 0 ? snapshot.strengths.map(s => (
                    <Badge key={s} variant="outline" className="bg-green-50 border-green-200 text-green-800">{s}</Badge>
                  )) : <span className="text-sm text-slate-500">Keep practicing to build strengths!</span>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Needs Review
                </h4>
                <div className="flex flex-wrap gap-2">
                  {snapshot.weaknesses.length > 0 ? snapshot.weaknesses.map(w => (
                    <Badge key={w} variant="outline" className="bg-red-50 border-red-200 text-red-800">{w}</Badge>
                  )) : <span className="text-sm text-slate-500">No major weaknesses detected.</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Breakdown</CardTitle>
            <CardDescription>Your mastery score per topic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {snapshot.mastery.map((m: TopicMastery) => (
              <div key={m.topic_id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{m.topic}</span>
                  <span className="font-bold">{m.mastery.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${getBandColor(m.band)}`} style={{ width: `${m.mastery}%` }}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
