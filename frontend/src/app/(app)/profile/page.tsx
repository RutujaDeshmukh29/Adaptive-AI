"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib";
import { LearnerSnapshot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Target, Clock, Award, Flame, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    goal: "",
    study_time_minutes: 60,
    experience_level: "beginner",
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi<LearnerSnapshot>("/api/profile");
        setSnapshot(data);
        setFormData({
          goal: data.goal,
          study_time_minutes: data.study_time_minutes,
          experience_level: data.experience_level,
        });
      } catch (err: any) {
        setError(err.detail || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const updated = await fetchApi<LearnerSnapshot>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      setSnapshot(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.detail || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No profile data found. Please ensure you have completed onboarding.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Profile & Settings</h1>
        <p className="mt-1 text-slate-500">
          Manage your personal study goals, pacing preferences, and review your mastery profile.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span>Profile preferences successfully updated! The AI tutor will now adapt accordingly.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="border-slate-200 shadow-sm md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <User className="h-10 w-10" />
            </div>
            <CardTitle className="text-xl">{snapshot.user.name}</CardTitle>
            <CardDescription>{snapshot.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Subject</span>
              <span className="font-semibold text-slate-900">{snapshot.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Academic Level</span>
              <span className="font-medium text-slate-700">{snapshot.academic_level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Day Streak</span>
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" /> {snapshot.streak_days} Days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Quizzes</span>
              <span className="font-bold text-slate-800">{snapshot.total_quizzes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Uploaded Docs</span>
              <span className="font-bold text-slate-800">{snapshot.materials_count}</span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Goals & Preferences Form */}
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-primary" /> Learning Preferences
            </CardTitle>
            <CardDescription>
              Changes made here immediately modify how the AI tutor crafts explanations and quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-sm font-medium">Primary Goal</Label>
                <Input
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="e.g. Master algorithms, learn Python for data science, ace final exam"
                  required
                />
                <p className="text-xs text-slate-400">The AI assistant uses this to contextualize explanations.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="study_time" className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" /> Daily Target (Minutes)
                  </Label>
                  <Input
                    id="study_time"
                    type="number"
                    min={10}
                    max={480}
                    value={formData.study_time_minutes}
                    onChange={(e) => setFormData({ ...formData, study_time_minutes: parseInt(e.target.value, 10) || 60 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp_level" className="text-sm font-medium">Self-Assessed Level</Label>
                  <select
                    id="exp_level"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="beginner">Beginner (Foundations & Syntax)</option>
                    <option value="intermediate">Intermediate (Problem Solving & Logic)</option>
                    <option value="advanced">Advanced (Optimization & Architecture)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button type="submit" disabled={saving} className="font-medium">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Snapshot Summary Cards */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" /> Mastery Profile Summary
          </CardTitle>
          <CardDescription>Mathematical aggregate calculated from your recent activities and quizzes.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Overall Mastery</span>
            <p className="text-2xl font-bold text-slate-900">{snapshot.overall_mastery.toFixed(1)}%</p>
            <span className="text-xs text-slate-500 capitalize">Trend: {snapshot.recent_trend}</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs text-green-700 uppercase tracking-wider font-semibold">Top Strengths</span>
            <div className="flex flex-wrap gap-1">
              {snapshot.strengths.length > 0 ? (
                snapshot.strengths.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400">Complete more quizzes to surface strengths</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs text-amber-700 uppercase tracking-wider font-semibold">Focus Areas</span>
            <div className="flex flex-wrap gap-1">
              {snapshot.weaknesses.length > 0 ? (
                snapshot.weaknesses.map((w) => (
                  <Badge key={w} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    {w}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400">No current weak spots detected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
