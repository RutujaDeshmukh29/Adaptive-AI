"use client";

import { useEffect, useState, Suspense } from "react";
import { fetchApi } from "@/lib";
import { PathResponse, PathItem, PathChecklistItem, PathResourceItem } from "@/lib/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import {
  Loader2, CheckCircle2, Circle, Lock, PlayCircle, GraduationCap,
  Sparkles, ArrowRight, ArrowUp, ChevronDown, ChevronUp, Clock,
  BookOpen, ExternalLink, Video, FileText, Check, Award,
  Flame, HelpCircle, Layers, Send, RefreshCw, Zap
} from "lucide-react";

function PathContent() {
  const [pathData, setPathData] = useState<PathResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetDays, setTargetDays] = useState<number>(14);
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);

  // Expanded milestone details (checklist and resources)
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);

  // Local checklist state (persisted per topic)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // AI Prompt Chat / Custom Roadmap Bar
  const [promptInput, setPromptInput] = useState<string>("");
  const [generatingCustom, setGeneratingCustom] = useState<boolean>(false);
  const [customActive, setCustomActive] = useState<boolean>(false);

  // Floating Back to Top
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

  // Initial load of checklist states from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adapted_path_checklist");
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Fetch learning path based on target days
  const loadPath = async (days: number = targetDays) => {
    setLoading(true);
    try {
      const data = await fetchApi<PathResponse>(`/api/path?days=${days}`);
      if (data) {
        setPathData(data);
        // Find current active item
        const curIdx = data.items.findIndex((it) => it.status === "current");
        if (curIdx !== -1) {
          setActiveModuleIdx(curIdx);
          setExpandedTopicId(data.items[curIdx].topic_id);
        } else if (data.items.length > 0) {
          setActiveModuleIdx(0);
          setExpandedTopicId(data.items[0].topic_id);
        }
      }
    } catch (e) {
      console.error("Failed to load learning path:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPath(targetDays);
  }, [targetDays]);

  // Handle checking/unchecking a checklist item
  const toggleChecklistItem = (topicId: number, itemId: string) => {
    const key = `${topicId}_${itemId}`;
    const nextChecked = !checkedItems[key];
    const updated = { ...checkedItems, [key]: nextChecked };
    setCheckedItems(updated);

    try {
      localStorage.setItem("adapted_path_checklist", JSON.stringify(updated));
    } catch {}
  };

  // Generate Custom AI Roadmap from user prompt
  const handleGenerateCustomRoadmap = async (customPrompt?: string) => {
    const query = customPrompt || promptInput.trim();
    if (!query) return;

    setGeneratingCustom(true);
    try {
      const data = await fetchApi<PathResponse>("/api/path/custom-roadmap", {
        method: "POST",
        body: JSON.stringify({
          prompt: query,
          days: targetDays,
        }),
      });

      if (data && data.items && data.items.length > 0) {
        setPathData(data);
        setCustomActive(true);
        setActiveModuleIdx(0);
        setExpandedTopicId(data.items[0].topic_id);
      }
    } catch (err) {
      console.error("Failed to generate custom roadmap:", err);
    } finally {
      setGeneratingCustom(false);
    }
  };

  // Reset to original enrolled path
  const handleResetPath = () => {
    setCustomActive(false);
    setPromptInput("");
    loadPath(targetDays);
  };

  if (loading && !pathData) {
    return (
      <div className="flex flex-col justify-center items-center h-[55vh] gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        <p className="text-xs text-slate-400 font-medium">Calibrating your adaptive roadmap...</p>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Failed to load learning path.</p>
        <Button onClick={() => loadPath(targetDays)}>Retry</Button>
      </div>
    );
  }

  // Active module calculation
  const activeModule = pathData.items[activeModuleIdx] || pathData.items[0];

  // Calculate dynamic checklist completion for a topic
  const getTopicChecklistProgress = (item: PathItem) => {
    if (!item.checklist || item.checklist.length === 0) return item.mastery;
    const total = item.checklist.length;
    const completedCount = item.checklist.filter(
      (c) => checkedItems[`${item.topic_id}_${c.id}`]
    ).length;
    return Math.round((completedCount / total) * 100);
  };

  // Calculate overall path completion factoring in checklist ticks
  const totalChecklistItems = pathData.items.reduce(
    (acc, it) => acc + (it.checklist ? it.checklist.length : 0),
    0
  );
  const totalChecked = pathData.items.reduce((acc, it) => {
    if (!it.checklist) return acc;
    return (
      acc +
      it.checklist.filter((c) => checkedItems[`${it.topic_id}_${c.id}`]).length
    );
  }, 0);

  const dynamicOverallProgress = totalChecklistItems > 0
    ? Math.round(
        (totalChecked / totalChecklistItems) * 70 +
          (pathData.overall_progress * 0.3)
      )
    : Math.round(pathData.overall_progress);

  const completedMilestonesCount = pathData.items.filter(
    (it) => it.status === "done" || getTopicChecklistProgress(it) === 100
  ).length;

  const hoursPerDay = ((pathData.items.length * 2.5) / targetDays).toFixed(1);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Bar */}
      <ScrollReveal pop={false}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 dark:border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Learning Path
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Personalized curriculum adapting to your mastery level, target timeline, and goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>
                Target: {pathData.subject || "Deep Learning"} · {dynamicOverallProgress}% Completed
              </span>
            </div>

            {customActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPath}
                className="h-9 text-xs gap-1.5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset to Enrolled Path
              </Button>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* AI Curriculum Prompt / Chat Border Bar */}
      <ScrollReveal delay={50} pop={true}>
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>AI Curriculum Architect & Custom Roadmap</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Timeline:</span>
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTargetDays(d)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    targetDays === d
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Prompt Input */}
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerateCustomRoadmap();
                }}
                placeholder="Tell AI what you want to learn (e.g. 'Master LangChain & RAG in 14 days' or 'Learn Full-Stack Data Structures in 21 days')..."
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200/90 dark:border-indigo-800/80 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs text-slate-900 dark:text-white"
              />
            </div>

            <Button
              onClick={() => handleGenerateCustomRoadmap()}
              disabled={generatingCustom || !promptInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 h-11 sm:h-auto rounded-2xl text-xs sm:text-sm font-semibold gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              {generatingCustom ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Designing Roadmap...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate Roadmap</span>
                </>
              )}
            </Button>
          </div>

          {/* Quick Preset Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Quick tracks:</span>
            {[
              "Attention Mechanisms & Transformers in 14 Days",
              "Deep Learning Foundations in 21 Days",
              "Python Programming in 7 Days",
              "Data Structures & Algorithms in 30 Days"
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPromptInput(chip);
                  handleGenerateCustomRoadmap(chip);
                }}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-300 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-all shadow-2xs cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Current Active Module Banner (Matching HTML Template) */}
      <ScrollReveal delay={100} pop={true}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
                Current Module · Step {activeModuleIdx + 1} of {pathData.items.length} · {activeModule.day_range || "Day 1–3"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated {activeModule.estimated_hours || 2.5} hrs remaining</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {activeModule.topic}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
                {activeModule.reason}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Module Progress (Checklist & Mastery)</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {getTopicChecklistProgress(activeModule)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${getTopicChecklistProgress(activeModule)}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link href={`/practice?topic_id=${activeModule.topic_id}`}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold px-6 py-3 h-11 gap-2 shadow-sm shadow-indigo-600/25 cursor-pointer">
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                onClick={() => {
                  setExpandedTopicId(
                    expandedTopicId === activeModule.topic_id ? null : activeModule.topic_id
                  );
                }}
                className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 h-11 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {expandedTopicId === activeModule.topic_id ? "Hide Syllabus & Checklist" : "View Syllabus & Checklist"}
              </Button>

              <Link href={`/challenges?topic_id=${activeModule.topic_id}`}>
                <Button variant="outline" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 h-11 rounded-xl gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Practice Code Challenge</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 2-Column Roadmap Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Roadmap Milestones & Checklist (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <ScrollReveal delay={150}>
            <div className="flex items-center justify-between px-1 mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Roadmap Milestones ({targetDays}-Day Schedule)
              </h3>
              <span className="text-xs text-slate-400">
                Click any milestone to open checklist & recommendations
              </span>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {pathData.items.map((item, idx) => {
              const isExpanded = expandedTopicId === item.topic_id;
              const isCurrent = item.status === "current";
              const isDone = item.status === "done" || getTopicChecklistProgress(item) === 100;
              const topicProgress = getTopicChecklistProgress(item);

              return (
                <ScrollReveal key={item.topic_id || idx} delay={100 + idx * 40} pop={true}>
                  <div
                    className={`bg-white dark:bg-slate-900 rounded-2xl transition-all overflow-hidden ${
                      isCurrent
                        ? "border-2 border-indigo-600 shadow-sm ring-2 ring-indigo-500/10"
                        : "border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() =>
                        setExpandedTopicId(isExpanded ? null : item.topic_id)
                      }
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Status Icon */}
                        {isDone ? (
                          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}

                        {/* Title & Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                              {item.topic}
                            </h4>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                Active Module
                              </span>
                            )}
                            {item.day_range && (
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {item.day_range}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                              {isDone
                                ? `Completed · ${topicProgress}%`
                                : isCurrent
                                ? `In Progress · ${topicProgress}% completed`
                                : "Upcoming Milestone"}
                            </span>
                            <span>•</span>
                            <span>{item.estimated_hours || 2.5} hrs</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Indicator / Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent ? (
                          <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        ) : isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Progress Bar Strip */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isDone ? "bg-emerald-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${topicProgress}%` }}
                      ></div>
                    </div>

                    {/* Expanded Drawer: Checklist & Curated Resources */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in">
                        {/* 1. Interactive Checklist Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Concept Checklist & Competency Drills</span>
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {topicProgress}% verified
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(item.checklist || []).map((chk) => {
                              const isChecked = !!checkedItems[`${item.topic_id}_${chk.id}`];
                              return (
                                <div
                                  key={chk.id}
                                  onClick={() => toggleChecklistItem(item.topic_id, chk.id)}
                                  className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer select-none ${
                                    isChecked
                                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-slate-800 dark:text-slate-200"
                                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                      isChecked
                                        ? "bg-emerald-600 text-white shadow-2xs"
                                        : "border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <span
                                    className={`leading-relaxed ${
                                      isChecked ? "line-through opacity-70" : ""
                                    }`}
                                  >
                                    {chk.title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Curated Recommendations: YouTube & Docs */}
                        {item.resources && item.resources.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Curated Learning Recommendations & Links</span>
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {item.resources.map((res, rIdx) => {
                                const isYt = res.type === "youtube";
                                const isPaper = res.type === "paper";
                                const isPractice = res.type === "practice";

                                return (
                                  <a
                                    key={rIdx}
                                    href={res.url}
                                    target={isPractice ? "_self" : "_blank"}
                                    rel="noreferrer"
                                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs transition-all flex flex-col justify-between gap-2 group"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                          {isYt ? (
                                            <span className="text-red-600 flex items-center gap-1">
                                              <Video className="w-3.5 h-3.5" /> YouTube
                                            </span>
                                          ) : isPaper ? (
                                            <span className="text-purple-600 flex items-center gap-1">
                                              <FileText className="w-3.5 h-3.5" /> Paper
                                            </span>
                                          ) : isPractice ? (
                                            <span className="text-indigo-600 flex items-center gap-1">
                                              <Zap className="w-3.5 h-3.5" /> Drill
                                            </span>
                                          ) : (
                                            <span className="text-blue-600 flex items-center gap-1">
                                              <BookOpen className="w-3.5 h-3.5" /> Doc
                                            </span>
                                          )}
                                        </div>
                                        <span>{res.duration_or_pages}</span>
                                      </div>

                                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug">
                                        {res.title}
                                      </h5>
                                      {res.summary && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                          {res.summary}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium">
                                      <span>{res.channel_or_author || "External Resource"}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Quick Practice Launcher */}
                        <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-200/60 dark:border-slate-800">
                          <Link href={`/practice?topic_id=${item.topic_id}`}>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 h-9">
                              <GraduationCap className="w-4 h-4" />
                              <span>Take Quiz on {item.topic}</span>
                            </Button>
                          </Link>
                          <Link href={`/challenges?topic_id=${item.topic_id}`}>
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-9">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>Code Lab Exercise</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Right Column: Milestones, Pace & Timeline Settings (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Milestones & Pace Card (Matching HTML Template) */}
          <ScrollReveal delay={150} pop={true}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Milestones & Pace</h3>
              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                  <span>Concepts & Modules Mastered</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {completedMilestonesCount} of {pathData.items.length}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (completedMilestonesCount / Math.max(1, pathData.items.length)) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Estimated completion in{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ~{Math.ceil(targetDays / 7)} weeks
                </span>{" "}
                at your current 1.4x pace.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 2: Weekly Goal Card (Matching HTML Template) */}
          <ScrollReveal delay={200} pop={true}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Goal</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  4.0
                </span>
                <span className="text-sm text-slate-500">/ 6.0 hrs logged</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "66%" }}></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                2.0 hours remaining to achieve your weekly target.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 3: Timeline & Daily Commitment Card */}
          <ScrollReveal delay={250} pop={true}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Target Schedule</h3>
                <Badge variant="outline" className="text-xs font-mono font-bold">
                  {targetDays} Days
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTargetDays(d)}
                    className={`py-2 text-center rounded-xl border text-xs font-bold transition-all ${
                      targetDays === d
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Recommended Daily Commitment:
                </span>
                <p>
                  ~<span className="font-bold text-indigo-600 dark:text-indigo-400">{hoursPerDay} hrs/day</span> across {pathData.items.length} milestones to complete on schedule.
                </p>
              </div>
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

export default function PathPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      }
    >
      <PathContent />
    </Suspense>
  );
}
