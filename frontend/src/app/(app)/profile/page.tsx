"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib";
import { LearnerSnapshot, TopicMastery } from "@/lib/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import {
  Sparkles, ArrowRight, ArrowUp, Check, Edit3, Camera,
  BookOpen, Target, TrendingUp, AlertCircle,
  FileText, Send, Flag, Play, Award, Brain, Clock, ChevronRight,
  BarChart2, HelpCircle, Flame, User, X, Upload, CheckCircle2,
  FolderSpecial, Lightbulb, Compass, MessageSquare
} from "lucide-react";

interface MaterialItem {
  id: number;
  filename: string;
  status: string;
  chunk_count: number;
  uploaded_at: string;
}

interface ActivityItem {
  id: number;
  activity_type: string;
  topic_name?: string;
  description: string;
  result?: any;
  time_str: string;
  date_str: string;
}

const AVATAR_PRESETS = [
  {
    id: "preset-1",
    label: "Aarav (Default)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-2",
    label: "Tech Scholar",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-3",
    label: "AI Engineer",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-4",
    label: "Developer",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-5",
    label: "Creative Coder",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-6",
    label: "Researcher",
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80",
  },
];

const STREAM_OPTIONS = [
  "Computer Science & Artificial Intelligence",
  "Information Technology & Software Engineering",
  "Science & Mathematics (PCM / High School)",
  "Data Science & Applied Statistics",
  "Electronics & Communication Engineering",
  "Mechanical & Mechatronics Engineering",
  "Commerce, Finance & Computational Economics",
  "Other / Custom Specialization",
];

const DEGREE_OPTIONS = [
  "B.Tech / B.E (3rd Year)",
  "B.Tech / B.E (4th Year / Final Year)",
  "B.Tech / B.E (2nd Year)",
  "B.Sc / BCA (Undergraduate)",
  "Grade 12 / Higher Secondary (CBSE/State)",
  "Grade 11 / Secondary",
  "Postgraduate / Master's (M.Tech/MS/MBA)",
  "Self-Paced Professional Learner",
  "Other / Custom Standard",
];

const SUBJECT_TRACKS = [
  { subject: "Deep Learning", category: "Artificial Intelligence", desc: "Neural Networks, Transformers, RAG & Vector Embeddings" },
  { subject: "Python", category: "Programming & Foundations", desc: "Core Syntax, Control Flow, Functions, OOP & Algorithms" },
  { subject: "Data Structures & Algorithms", category: "Computer Science", desc: "Arrays, Trees, Graphs, Dynamic Programming & LeetCode" },
  { subject: "Engineering Mathematics", category: "Core STEM", desc: "Linear Algebra, Multivariable Calculus & Probability" },
  { subject: "High School Physics", category: "Core STEM", desc: "Mechanics, Electromagnetism, Optics & Modern Physics" },
];

export default function DynamicLearnerProfile() {
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Form State for User Details
  const [formName, setFormName] = useState("Aarav Sharma");
  const [formAvatar, setFormAvatar] = useState(AVATAR_PRESETS[0].url);
  const [formStream, setFormStream] = useState("Computer Science & Artificial Intelligence");
  const [customStream, setCustomStream] = useState("");
  const [formDegree, setFormDegree] = useState("B.Tech / B.E (3rd Year)");
  const [customDegree, setCustomDegree] = useState("");
  const [formSubject, setFormSubject] = useState("Deep Learning");
  const [formCategory, setFormCategory] = useState("Artificial Intelligence");
  const [formGoal, setFormGoal] = useState("Master Generative AI Architectures & Ace Placements");
  const [formBio, setFormBio] = useState("Undergraduate student focusing on adaptive deep learning, attention mechanisms, and building production-grade RAG systems.");
  const [formStudyTime, setFormStudyTime] = useState(45);
  const [formExperience, setFormExperience] = useState("intermediate");
  const [formModality, setFormModality] = useState("Visual & Interactive");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profileRes, materialsRes, reportRes] = await Promise.allSettled([
          fetchApi<LearnerSnapshot>("/api/profile"),
          fetchApi<{ materials: MaterialItem[]; total_chunks: number }>("/api/materials"),
          fetchApi<any>("/api/parent/report"),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value) {
          const snap = profileRes.value;
          setSnapshot(snap);

          // Populate form fields from backend snapshot and preferences
          if (snap.user?.name) setFormName(snap.user.name);
          if (snap.subject) setFormSubject(snap.subject);
          if (snap.goal) setFormGoal(snap.goal);
          if (snap.study_time_minutes) setFormStudyTime(snap.study_time_minutes);
          if (snap.experience_level) setFormExperience(snap.experience_level);
          if (snap.academic_level) {
            setFormDegree(snap.academic_level);
          }

          const prefs = (snap as any).preferences || {};
          if (prefs.avatar_url) setFormAvatar(prefs.avatar_url);
          if (prefs.stream) setFormStream(prefs.stream);
          if (prefs.description) setFormBio(prefs.description);
          if (prefs.degree_standard) setFormDegree(prefs.degree_standard);
          if (prefs.modality) setFormModality(prefs.modality);
          if (prefs.subject_category) setFormCategory(prefs.subject_category);
        }

        // Check local storage overrides
        const localAvatar = localStorage.getItem("user_avatar");
        if (localAvatar) setFormAvatar(localAvatar);
        const localName = localStorage.getItem("user_name");
        if (localName) setFormName(localName);
        const localDegree = localStorage.getItem("user_degree");
        if (localDegree) setFormDegree(localDegree);
        const localStream = localStorage.getItem("user_stream");
        if (localStream) setFormStream(localStream);
        const localBio = localStorage.getItem("user_bio");
        if (localBio) setFormBio(localBio);

        if (materialsRes.status === "fulfilled" && materialsRes.value?.materials) {
          setMaterials(materialsRes.value.materials);
        }

        if (reportRes.status === "fulfilled" && reportRes.value?.activities) {
          setActivities(reportRes.value.activities);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Back to Top Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle custom image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Please upload an image smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes to backend & synchronize with localStorage and events
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const finalStream = formStream === "Other / Custom Specialization" && customStream.trim() ? customStream.trim() : formStream;
    const finalDegree = formDegree === "Other / Custom Standard" && customDegree.trim() ? customDegree.trim() : formDegree;

    const payload = {
      name: formName.trim(),
      academic_level: finalDegree,
      subject: formSubject,
      goal: formGoal.trim(),
      study_time_minutes: Number(formStudyTime),
      experience_level: formExperience,
      preferences: {
        avatar_url: formAvatar,
        stream: finalStream,
        degree_standard: finalDegree,
        description: formBio.trim(),
        subject_category: formCategory,
        modality: formModality,
      },
    };

    try {
      const updatedSnapshot = await fetchApi<LearnerSnapshot>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (updatedSnapshot) {
        setSnapshot(updatedSnapshot);
      }

      // Save to localStorage for instant hydration across pages
      localStorage.setItem("user_name", formName.trim());
      localStorage.setItem("user_avatar", formAvatar);
      localStorage.setItem("user_degree", finalDegree);
      localStorage.setItem("user_stream", finalStream);
      localStorage.setItem("user_bio", formBio.trim());

      // Dispatch global event so Sidebar and Top Header update immediately
      window.dispatchEvent(new Event("profile-updated"));

      setSaveSuccess(true);
      setShowEditModal(false);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Fallback local save if backend is offline
      localStorage.setItem("user_name", formName.trim());
      localStorage.setItem("user_avatar", formAvatar);
      localStorage.setItem("user_degree", finalDegree);
      localStorage.setItem("user_stream", finalStream);
      localStorage.setItem("user_bio", formBio.trim());
      window.dispatchEvent(new Event("profile-updated"));
      setSaveSuccess(true);
      setShowEditModal(false);
      setTimeout(() => setSaveSuccess(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Metrics computation
  const overallMastery = snapshot?.overall_mastery ? Math.round(snapshot.overall_mastery) : 84;
  const levelNum = Math.min(5, Math.max(1, Math.floor(overallMastery / 20) + 1));
  const levelLabel = formExperience ? (formExperience.charAt(0).toUpperCase() + formExperience.slice(1)) : "Advanced";
  const retentionRate = Math.min(99, Math.max(70, Math.round(overallMastery * 0.95 + 10)));

  // Mastery topics list
  const masteryList: TopicMastery[] = snapshot?.mastery && snapshot.mastery.length > 0
    ? snapshot.mastery
    : [
        { topic_id: 1, topic: "Neural Networks & Backpropagation", mastery: 92, band: "mastered", attempts: 4 },
        { topic_id: 2, topic: "Optimization & Loss Functions", mastery: 88, band: "competent", attempts: 3 },
        { topic_id: 3, topic: "Vector Embeddings & ChromaDB", mastery: 81, band: "competent", attempts: 2 },
        { topic_id: 4, topic: "RAG Pipeline Orchestration", mastery: 68, band: "developing", attempts: 2 },
        { topic_id: 5, topic: "Attention Mechanisms & Transformers", mastery: 54, band: "struggling", attempts: 1 },
      ];

  // Priority gap topic
  const priorityGap = masteryList.find(m => (m.attempts || 0) > 0 && m.mastery < 65) || masteryList[masteryList.length - 1];

  return (
    <div className="flex flex-col gap-8 max-w-[1520px] mx-auto w-full pb-16 relative">
      
      {/* Save Success Banner Notification */}
      {saveSuccess && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white shadow-xl animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div className="flex flex-col">
            <span className="text-sm font-bold">Profile Details Saved</span>
            <span className="text-xs text-emerald-100">Adaptive curriculum and AI models recalibrated.</span>
          </div>
        </div>
      )}

      {/* ── 1. Top Learner Overview Banner with 3 Clean Minimalist Stats ── */}
      <ScrollReveal delay={40} pop={true}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-2xl p-8 lg:p-10 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <img 
                src={formAvatar} 
                alt={formName} 
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover shadow-sm ring-4 ring-indigo-50 dark:ring-indigo-950/60"
              />
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute inset-0 rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer text-[10px] font-semibold gap-1"
                title="Change profile picture"
              >
                <Camera className="w-5 h-5" />
                <span>Edit Photo</span>
              </button>
            </div>

            {/* Student Info */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {formName}
                </h1>
                <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-3 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                  Level {levelNum} · {levelLabel}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                <span>Enrolled Track: <strong className="text-indigo-600 dark:text-indigo-400">{formSubject}</strong></span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-500 dark:text-slate-400">{formDegree}</span>
              </p>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                {formBio}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Degree Details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Clean 3-stat summary with minimal borderless aesthetic */}
          <div className="flex items-center gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Mastery</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{overallMastery}%</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+3.5%</span>
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adaptive Level</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">L{levelNum}.2</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Calibrated</span>
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Retention Rate</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{retentionRate}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">90d</span>
              </div>
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* ── 2. Main 2-Column Spacious Content Grid (65% / 35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Primary Left Column: Topic Mastery & Recalibration Feed (~65%) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Card: Competency & Topic Mastery */}
          <ScrollReveal delay={100} pop={true}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Core Competencies</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time mastery levels across <strong className="text-slate-700 dark:text-slate-300">{formSubject}</strong> modules
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
                  {masteryList.length} Active Modules
                </span>
              </div>

              {/* Spacious, clear progress bars */}
              <div className="flex flex-col gap-6 pt-2">
                {masteryList.map((item) => {
                  const score = Math.round(item.mastery || 0);
                  const isMastered = score >= 70;
                  const isStruggling = (item.attempts || 0) > 0 && score < 60;
                  const isProficient = score >= 60 && !isMastered;
                  const isUnstarted = (item.attempts || 0) === 0;

                  return (
                    <div key={item.topic_id || item.topic} className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-200">
                            {item.topic}
                          </span>
                          {isMastered && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                              Mastered
                            </span>
                          )}
                          {isProficient && (
                            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900">
                              Proficient
                            </span>
                          )}
                          {isStruggling && (
                            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                              Current Focus
                            </span>
                          )}
                          {isUnstarted && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              Unstarted
                            </span>
                          )}
                        </div>
                        <span className={`font-bold ${isStruggling ? "text-rose-600 dark:text-rose-400" : isMastered ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMastered ? "bg-emerald-500" : isStruggling ? "bg-rose-500" : isProficient ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          style={{ width: `${Math.max(score, isUnstarted ? 0 : 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Card: Calibration Updates (Activity Feed) */}
          <ScrollReveal delay={150} pop={true}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Learning Events</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Auto-calibrated
                </span>
              </div>

              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {activities.length > 0 ? (
                  activities.slice(0, 4).map((act) => (
                    <div key={act.id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0 gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                          {act.activity_type === "quiz" ? <Target className="w-4 h-4" /> : act.activity_type === "chat" ? <MessageSquare className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {act.topic_name || act.activity_type.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {act.description}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 font-medium">
                        {act.date_str}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start justify-between py-4 first:pt-0 gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">Diagnostic Evaluation Completed</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Calibrated baseline difficulty in {formSubject} and initialized dynamic competency tracing.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 font-medium">Today, 10:45 AM</span>
                    </div>

                    <div className="flex items-start justify-between py-4 gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Brain className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">AI Assistant Interaction Session</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Validated conceptual understanding in dimensional projection and matrix transformations.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 font-medium">Yesterday</span>
                    </div>

                    <div className="flex items-start justify-between py-4 last:pb-0 gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">Study Interval Calibrated</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Scheduled spaced repetition review for {masteryList[0]?.topic || "Foundational concepts"}.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 font-medium">3 days ago</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </ScrollReveal>

        </div>

        {/* Secondary Right Column: Current Focus & Learning Insights (~35%) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Card: Priority Gap / Current Focus */}
          <ScrollReveal delay={120} pop={true}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900">
                  <Flag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Current Priority Focus
                </span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {priorityGap ? Math.round(priorityGap.mastery) : 54}% Mastery
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {priorityGap?.topic || "Attention Mechanisms & Multi-Head Projections"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Targeting foundational concepts and problem sets to calibrate your mastery in {formSubject}.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Estimated: <strong>{formStudyTime} mins</strong></span>
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">1 targeted session</span>
              </div>

              <Link
                href="/practice"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-xs"
              >
                <span>Review Remedial Practice ({formStudyTime} min)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Card: Study Habits & Insights */}
          <ScrollReveal delay={160} pop={true}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Study Insights</h3>
                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Peak Focus Window</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Morning (9:00 – 11:30 AM)</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cognitive engagement is highest during early sessions.</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Response Pace</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">42 seconds / question</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Balanced pacing with high consistency across tests.</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preferred Modality</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formModality}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Responds best to visual architecture diagrams and guided code walk-throughs.</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Connected Notes Card */}
          <ScrollReveal delay={200} pop={true}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {materials.length} Indexed Academic Notes
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Connected to Gemini Vector RAG
                  </span>
                </div>
              </div>
              <Link
                href="/materials"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage →
              </Link>
            </div>
          </ScrollReveal>

        </div>

      </div>

      {/* ── 3. Comprehensive Edit Profile Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Learner Profile & Stream Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AdaptEd AI dynamically updates study trajectories to match your real academic details.</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveChanges} className="flex flex-col gap-6 pt-5">
              
              {/* Profile Picture Selector */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <img
                    src={formAvatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-600 shrink-0"
                  />
                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choose from stylish presets or upload your own:</span>
                    
                    {/* Preset Avatars Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {AVATAR_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormAvatar(p.url)}
                          className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition-all cursor-pointer ${
                            formAvatar === p.url ? "ring-indigo-600 scale-105" : "ring-transparent opacity-70 hover:opacity-100"
                          }`}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Custom Upload Button */}
                    <div className="pt-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Custom Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                  placeholder="Enter your name..."
                />
              </div>

              {/* Stream / Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Academic Stream / Department / Specialization
                </label>
                <select
                  value={formStream}
                  onChange={(e) => setFormStream(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                >
                  {STREAM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {formStream === "Other / Custom Specialization" && (
                  <input
                    type="text"
                    value={customStream}
                    onChange={(e) => setCustomStream(e.target.value)}
                    placeholder="Type your custom stream (e.g. Aerospace Engineering, Bio-Tech)..."
                    className="mt-2 w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs"
                  />
                )}
              </div>

              {/* Standard / Degree / Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Standard / Degree / Current Academic Year
                </label>
                <select
                  value={formDegree}
                  onChange={(e) => setFormDegree(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                >
                  {DEGREE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {formDegree === "Other / Custom Standard" && (
                  <input
                    type="text"
                    value={customDegree}
                    onChange={(e) => setCustomDegree(e.target.value)}
                    placeholder="Type your custom degree (e.g. Diploma 2nd Year, High School Senior)..."
                    className="mt-2 w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs"
                  />
                )}
              </div>

              {/* Subject Track & Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Subject Track (Dynamic Adaptation)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUBJECT_TRACKS.map((trk) => {
                    const isSelected = formSubject === trk.subject;
                    return (
                      <button
                        key={trk.subject}
                        type="button"
                        onClick={() => {
                          setFormSubject(trk.subject);
                          setFormCategory(trk.category);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"}`}>
                            {trk.subject}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{trk.category}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{trk.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Goal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Academic Goal
                </label>
                <input
                  type="text"
                  required
                  value={formGoal}
                  onChange={(e) => setFormGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                  placeholder="e.g. Master Deep Learning, Clear GATE 2026, 95%+ in Boards..."
                />
              </div>

              {/* Description / Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Personal Description / Learning Bio
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium resize-none leading-relaxed"
                  placeholder="Describe your current focus, background, or exam timeline..."
                ></textarea>
              </div>

              {/* 2-Column: Study Time & Experience Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Daily Study Target
                  </label>
                  <select
                    value={formStudyTime}
                    onChange={(e) => setFormStudyTime(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm font-medium"
                  >
                    <option value={30}>30 mins / day (Steady)</option>
                    <option value={45}>45 mins / day (Standard)</option>
                    <option value={60}>60 mins / day (Intensive)</option>
                    <option value={90}>90 mins / day (Accelerated)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Current Experience Level
                  </label>
                  <select
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm font-medium"
                  >
                    <option value="beginner">Beginner (Foundations first)</option>
                    <option value="intermediate">Intermediate (Hands-on practice)</option>
                    <option value="advanced">Advanced (Deep mastery & exams)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save & Recalibrate Details</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── Floating Back to Top Button ── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 p-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
        title="Scroll back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

    </div>
  );
}
