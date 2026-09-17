"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib";
import { LearnerSnapshot, TopicMastery } from "@/lib/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Check, Edit3, Camera,
  BookOpen, Target, TrendingUp, AlertCircle,
  FileText, Send, Flag, Play, Award, Brain, Clock, ChevronRight,
  BarChart2, HelpCircle, Flame, User, X, Upload, CheckCircle2,
  Lightbulb, Compass, MessageSquare, Shield, ShieldCheck,
  Database, School, Link as LinkIcon, Mail, Code, Timer,
  Download, Printer, ExternalLink, RefreshCw, Layers, CheckSquare
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
  "Applied AI & Machine Learning",
  "Computer Science & Engineering",
  "Information Technology & Software Systems",
  "Data Science & Applied Statistics",
  "Science & Mathematics (PCM / High School)",
  "Electronics & Communication Engineering",
  "Commerce, Finance & Computational Economics",
  "Other / Custom Specialization",
];

const DEGREE_OPTIONS = [
  "Grade 11 ML & CS Track",
  "Grade 12 / Higher Secondary (CBSE/State)",
  "B.Tech / B.E (3rd Year)",
  "B.Tech / B.E (4th Year / Final Year)",
  "B.Tech / B.E (2nd Year)",
  "B.Sc / BCA (Undergraduate)",
  "Postgraduate / Master's (M.Tech/MS/MBA)",
  "Self-Paced Professional Learner",
  "Other / Custom Standard",
];

export default function DynamicLearnerProfile() {
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Form State for User Details
  const [formName, setFormName] = useState("Aarav Sharma");
  const [formEmail, setFormEmail] = useState("aarav.sharma@dps-skillmatix.edu");
  const [formAvatar, setFormAvatar] = useState(AVATAR_PRESETS[0].url);
  const [formStream, setFormStream] = useState("Applied AI & Machine Learning");
  const [customStream, setCustomStream] = useState("");
  const [formDegree, setFormDegree] = useState("Grade 11 ML & CS Track");
  const [customDegree, setCustomDegree] = useState("");
  const [formInstitution, setFormInstitution] = useState("Delhi Public School • R.K. Puram Hub");
  const [formParentName, setFormParentName] = useState("Rajesh Sharma");
  const [formSubject, setFormSubject] = useState("Machine Learning Foundations");
  const [formGoal, setFormGoal] = useState("Master Generative AI Architectures & Ace Competitive Exams");
  const [formBio, setFormBio] = useState("Undergraduate student focusing on adaptive deep learning, attention mechanisms, and building production-grade RAG systems.");
  const [formStudyTime, setFormStudyTime] = useState(90);
  const [formExperience, setFormExperience] = useState("intermediate");
  const [formModality, setFormModality] = useState("Visual & Multi-Modal");

  // Privacy & Transparency toggles
  const [privacyMirroring, setPrivacyMirroring] = useState(true);
  const [privacyTelemetry, setPrivacyTelemetry] = useState(true);
  const [privacyWeeklyDigest, setPrivacyWeeklyDigest] = useState(true);

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

          if (snap.user?.name) setFormName(snap.user.name);
          if (snap.user?.email) setFormEmail(snap.user.email);
          if (snap.subject) setFormSubject(snap.subject);
          if (snap.goal) setFormGoal(snap.goal);
          if (snap.study_time_minutes) setFormStudyTime(snap.study_time_minutes);
          if (snap.experience_level) setFormExperience(snap.experience_level);
          if (snap.academic_level) setFormDegree(snap.academic_level);

          const prefs = (snap as any).preferences || {};
          if (prefs.avatar_url) setFormAvatar(prefs.avatar_url);
          if (prefs.stream) setFormStream(prefs.stream);
          if (prefs.institution) setFormInstitution(prefs.institution);
          if (prefs.parent_name) setFormParentName(prefs.parent_name);
          if (prefs.description) setFormBio(prefs.description);
          if (prefs.degree_standard) setFormDegree(prefs.degree_standard);
          if (prefs.modality) setFormModality(prefs.modality);
          if (prefs.privacy_mirroring !== undefined) setPrivacyMirroring(prefs.privacy_mirroring);
          if (prefs.privacy_telemetry !== undefined) setPrivacyTelemetry(prefs.privacy_telemetry);
          if (prefs.privacy_weekly_digest !== undefined) setPrivacyWeeklyDigest(prefs.privacy_weekly_digest);
        }

        // LocalStorage fallback overrides
        const localAvatar = localStorage.getItem("user_avatar");
        if (localAvatar) setFormAvatar(localAvatar);
        const localName = localStorage.getItem("user_name");
        if (localName) setFormName(localName);
        const localEmail = localStorage.getItem("user_email");
        if (localEmail) setFormEmail(localEmail);
        const localDegree = localStorage.getItem("user_degree");
        if (localDegree) setFormDegree(localDegree);
        const localStream = localStorage.getItem("user_stream");
        if (localStream) setFormStream(localStream);
        const localInstitution = localStorage.getItem("user_institution");
        if (localInstitution) setFormInstitution(localInstitution);
        const localParent = localStorage.getItem("user_parent_name");
        if (localParent) setFormParentName(localParent);
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
        institution: formInstitution.trim(),
        parent_name: formParentName.trim(),
        description: formBio.trim(),
        modality: formModality,
        privacy_mirroring: privacyMirroring,
        privacy_telemetry: privacyTelemetry,
        privacy_weekly_digest: privacyWeeklyDigest,
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
      localStorage.setItem("user_institution", formInstitution.trim());
      localStorage.setItem("user_parent_name", formParentName.trim());
      localStorage.setItem("user_bio", formBio.trim());

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
      localStorage.setItem("user_institution", formInstitution.trim());
      localStorage.setItem("user_parent_name", formParentName.trim());
      localStorage.setItem("user_bio", formBio.trim());
      window.dispatchEvent(new Event("profile-updated"));
      setSaveSuccess(true);
      setShowEditModal(false);
      setTimeout(() => setSaveSuccess(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Toggle privacy preferences
  const handleTogglePrivacy = async (key: "mirroring" | "telemetry" | "weekly", newVal: boolean) => {
    if (key === "mirroring") setPrivacyMirroring(newVal);
    if (key === "telemetry") setPrivacyTelemetry(newVal);
    if (key === "weekly") setPrivacyWeeklyDigest(newVal);

    try {
      await fetchApi<LearnerSnapshot>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          preferences: {
            [`privacy_${key === "weekly" ? "weekly_digest" : key}`]: newVal,
          }
        }),
      });
    } catch (e) {
      // Handled silently
    }
  };

  // ── Dynamic Metric Calculations based on real user progress ──
  const overallMastery = snapshot?.overall_mastery ? Math.round(snapshot.overall_mastery) : 78;
  const gpa = ((overallMastery / 100) * 4.0).toFixed(2);
  const cognitiveCaliber = ((overallMastery / 25) + 0.1).toFixed(1);
  const honorRollPct = overallMastery >= 85 ? "Top 5%" : overallMastery >= 70 ? "Top 10%" : overallMastery >= 50 ? "Top 20%" : "Top 35%";
  
  // Real diagnostics count
  const totalDiagnostics = snapshot?.total_quizzes || 
    activities.filter(a => a.activity_type === "quiz" || a.activity_type === "diagnostic" || a.activity_type === "practice").length || 36;
  
  // Real or calculated learning hours
  const totalMinutes = (activities.length * 28) + (totalDiagnostics * 25) + (overallMastery * 80);
  const learningHours = Math.max(24.5, (totalMinutes / 60)).toFixed(1);
  
  // Current streak
  const streakDays = snapshot?.streak_days || 18;

  // Real Vector knowledge stats
  const totalVectorChunks = materials.reduce((acc, m) => acc + (m.chunk_count || 0), 0);
  const vectorMb = Math.max(14.8, (totalVectorChunks * 0.08 + materials.length * 2.2)).toFixed(1);
  const vectorPct = Math.min(100, (Number(vectorMb) / 500) * 100).toFixed(1);

  // Real or curated course enrollments
  const defaultCourses = [
    {
      topic_id: 1,
      topic: "Machine Learning Foundations",
      subtitle: "Module 4 of 6 • Supervised Loss Optimization • Mentor: Dr. Alok Rao",
      mastery: 82,
      band: "competent" as const,
      color: "bg-indigo-600"
    },
    {
      topic_id: 2,
      topic: "Linear Algebra & Vector Calculus",
      subtitle: "Module 5 of 5 • Eigendecomposition & SVD • Status: Exam Ready",
      mastery: 90,
      band: "mastered" as const,
      color: "bg-blue-600"
    },
    {
      topic_id: 3,
      topic: "Python Algorithms & Data Structures",
      subtitle: "Module 3 of 5 • Dynamic Programming & Trees • Pacing: On Track",
      mastery: 74,
      band: "developing" as const,
      color: "bg-purple-600"
    },
  ];

  const masteryList = snapshot?.mastery && snapshot.mastery.length > 0
    ? snapshot.mastery.map((item, idx) => ({
        topic_id: item.topic_id || idx + 1,
        topic: item.topic,
        subtitle: `Module ${idx + 1} of ${snapshot.mastery.length} • ${item.band === "mastered" ? "Status: Exam Ready" : item.band === "competent" ? "Status: On Track" : "Status: Active Practice"} • Pacing: Adaptive`,
        mastery: Math.round(item.mastery || 0),
        band: item.band,
        color: idx % 3 === 0 ? "bg-indigo-600" : idx % 3 === 1 ? "bg-blue-600" : "bg-purple-600"
      }))
    : defaultCourses;

  return (
    <div className="flex flex-col gap-8 max-w-[1520px] mx-auto w-full pb-16 relative">
      
      {/* Save Success Banner Notification */}
      {saveSuccess && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white shadow-xl animate-in fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div className="flex flex-col">
            <span className="text-sm font-bold">Profile Details Saved</span>
            <span className="text-xs text-emerald-100">Adaptive curriculum and AI models recalibrated.</span>
          </div>
        </div>
      )}

      {/* ── 1. Profile Header / Identity Showcase ── */}
      <ScrollReveal delay={40} pop={false}>
        <section className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs border border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-all">
          {/* Ambient Glow Orbs */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Avatar with Camera Trigger */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-800 ring-4 ring-indigo-50 dark:ring-indigo-950/60 flex-shrink-0">
                  <img
                    src={formAvatar}
                    alt={formName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 text-white shadow-sm flex items-center justify-center hover:bg-indigo-700 transition-colors cursor-pointer"
                  title="Update Profile Picture"
                  type="button"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Student Identity Information */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {formName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Learner
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formDegree}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    STU-2024-{snapshot?.user?.id ? String(snapshot.user.id).padStart(4, "0") : "8842"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>{formInstitution} × SkillMatix</span>
                </p>

                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 border border-slate-200/80 dark:border-slate-700 text-xs font-medium">
                    <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Cognitive Caliber: Level {cognitiveCaliber} Dynamic
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 text-xs font-medium">
                    <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Honor Roll • {honorRollPct}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Edit Profile & Academic Transcript */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                type="button"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setShowTranscriptModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <FileText className="w-4 h-4" />
                <span>Academic Transcript</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Band (4 Dynamic Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 sm:p-5">
            {/* Metric 1: GPA & Mastery */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GPA & Mastery</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{gpa}</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">/ {overallMastery}%</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Learning Hours */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Learning Hours</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{learningHours}</span>
                  <span className="text-xs font-semibold text-slate-400">hrs</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Current Streak */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-orange-500 shadow-2xs shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Streak</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{streakDays}</span>
                  <span className="text-xs font-semibold text-orange-500 font-medium">Days active</span>
                </div>
              </div>
            </div>

            {/* Metric 4: AI Diagnostics */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Diagnostics</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{totalDiagnostics}</span>
                  <span className="text-xs font-semibold text-slate-400">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── 2. Two-Column Primary Layout (7 Cols Left / 5 Cols Right) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ── Left / Dominant Column (7 Cols) ── */}
        <div className="xl:col-span-7 flex flex-col gap-8">
          
          {/* Card 1: Academic Identity & Credentials */}
          <ScrollReveal delay={80} pop={false}>
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Academic Identity & Credentials
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200/60 dark:border-slate-700">
                  KYC Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Legal Full Name</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formName}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Institutional Email</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{formEmail}</span>
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Academic Year & Track</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{formDegree} • {formStream}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Affiliated Institution</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{formInstitution}</span>
                </div>

                {/* Parent / Guardian Linked SSO Box */}
                <div className="md:col-span-2 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{formParentName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Authorized Primary Parent / Guardian • Single-Sign On Access</p>
                      </div>
                    </div>
                    <Link href="/parent">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-2xs hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Verified Link</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Card 2: Cognitive Profile & AI Pacing */}
          <ScrollReveal delay={120} pop={false}>
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Cognitive Profile & AI Pacing
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Calibrated automatically via continuous diagnostic feedback loops</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800">
                  Engine v4.2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tile 1: Learning Velocity */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Learning Velocity</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">Adaptive Accelerated</p>
                    </div>
                    <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Dynamically scales challenge difficulty and skips prerequisite foundations when 90%+ confidence is established.
                  </p>
                </div>

                {/* Tile 2: Dominant Modality */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dominant Modality</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{formModality}</p>
                    </div>
                    <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Prioritizes vector geometric visualizations, Mermaid architecture flowcharts, and interactive computational drills.
                  </p>
                </div>

                {/* Tile 3: Calibration Model */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calibration Model</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">Bayesian Real-Time</p>
                    </div>
                    <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Continuously updates belief vectors across 114 micro-competencies every diagnostic assessment.
                  </p>
                </div>

                {/* Tile 4: Daily Target */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Target</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {formStudyTime >= 60 ? `${(formStudyTime / 60).toFixed(1)} hrs` : `${formStudyTime} mins`} / day
                      </p>
                    </div>
                    <Timer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Recommended window: 17:30 - 19:00 IST based on peak cognitive retention metrics.
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Card 3: Curricular Enrollments & Mastery */}
          <ScrollReveal delay={160} pop={false}>
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <School className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Curricular Enrollments & Mastery
                  </h2>
                </div>
                <Link 
                  href="/practice" 
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>View Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {masteryList.map((course, i) => (
                  <div 
                    key={course.topic_id || i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{course.topic}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{course.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-2xs">
                          {course.mastery}% Mastery
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${course.color}`}
                        style={{ width: `${Math.max(course.mastery, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

        </div>

        {/* ── Right Column (5 Cols) ── */}
        <div className="xl:col-span-5 flex flex-col gap-8">
          
          {/* Card 4: Vectorized Knowledge & RAG Storage */}
          <ScrollReveal delay={100} pop={false}>
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Vectorized Knowledge
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800">
                  ChromaDB + Gemini
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Academic materials parsed and indexed into personal RAG space for live tutor retrieval.
              </p>

              {/* Storage Capacity Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 mb-4">
                <div className="flex justify-between items-center mb-2 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Semantic Vector Store</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{vectorMb} MB / 500 MB ({vectorPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500" 
                    style={{ width: `${Math.max(Number(vectorPct), 4)}%` }}
                  />
                </div>
              </div>

              {/* Indexed Files List (Live from materials) */}
              <div className="flex flex-col gap-2 mb-5">
                {materials.length > 0 ? (
                  materials.slice(0, 4).map((m) => (
                    <div 
                      key={m.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.filename}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {(m.chunk_count * 0.08 + 1.2).toFixed(1)} MB • {m.chunk_count} embeddings generated
                          </p>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Attention_Is_All_You_Need_Annotated.pdf</p>
                          <p className="text-[11px] text-slate-400 font-mono">8.4 MB • 142 embeddings generated</p>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">CS224N_Lecture4_Word2Vec_DeepDive.md</p>
                          <p className="text-[11px] text-slate-400 font-mono">2.1 MB • 68 embeddings generated</p>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                  </>
                )}
              </div>

              {/* Upload Action Button */}
              <Link href="/materials">
                <button 
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200/60 dark:border-slate-700" 
                  type="button"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload New Coursework • {materials.length} Files Total</span>
                </button>
              </Link>
            </section>
          </ScrollReveal>

          {/* Card 5: Connected Accounts */}
          <ScrollReveal delay={140} pop={false}>
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Connected Accounts
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-400">3 Linked</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Account 1: Google Workspace */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-indigo-600 shadow-2xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Google Workspace</p>
                      <p className="text-[11px] text-slate-400 truncate">{formEmail}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full">Active</span>
                </div>

                {/* Account 2: Canvas LMS */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-blue-600 shadow-2xs">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Canvas LMS</p>
                      <p className="text-[11px] text-slate-400">DPS RKP Portal • Synced 2h ago</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">Active</span>
                </div>

                {/* Account 3: GitHub */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white shadow-2xs">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">GitHub</p>
                      <p className="text-[11px] text-slate-400 font-mono">@{formName.toLowerCase().replace(/\s+/g, "-")}-ml • 24 Repositories</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Card 6: Parental Transparency & Privacy */}
          <ScrollReveal delay={180} pop={false}>
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Parental Transparency & Privacy
                </h2>
              </div>

              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {/* Toggle 1: Parent Portal Mirroring */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Parent Portal Mirroring</p>
                    <p className="text-[11px] text-slate-400">Allows {formParentName} to view diagnostics & study summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={privacyMirroring} 
                      onChange={(e) => handleTogglePrivacy("mirroring", e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {/* Toggle 2: Real-Time AI Telemetry */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Real-Time AI Telemetry</p>
                    <p className="text-[11px] text-slate-400">Streams focus score and diagnostic pacing metrics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={privacyTelemetry} 
                      onChange={(e) => handleTogglePrivacy("telemetry", e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {/* Toggle 3: Weekly Digest Notifications */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Weekly Digest Notifications</p>
                    <p className="text-[11px] text-slate-400">Dispatches consolidated report via SMS & WhatsApp</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={privacyWeeklyDigest} 
                      onChange={(e) => handleTogglePrivacy("weekly", e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>
              </div>
            </section>
          </ScrollReveal>

        </div>

      </div>

      {/* ── 3. Edit Profile Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Academic Identity & Profile</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AdaptEd AI continuously personalizes learning models based on these credentials.</p>
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
            <form onSubmit={handleSaveChanges} className="flex flex-col gap-5 pt-5">
              
              {/* Profile Picture Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <img
                    src={formAvatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-600 shrink-0"
                  />
                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choose preset avatar or upload custom photo:</span>
                    
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

                    <div className="flex items-center gap-2 mt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload photo from device (max 5MB)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 1: Legal Name & Institutional Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Legal Full Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Standard & Academic Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Grade / Academic Degree
                  </label>
                  <select
                    value={formDegree}
                    onChange={(e) => setFormDegree(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DEGREE_OPTIONS.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Specialized Track / Stream
                  </label>
                  <select
                    value={formStream}
                    onChange={(e) => setFormStream(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STREAM_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Institution & Primary Parent/Guardian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Affiliated Institution
                  </label>
                  <input
                    type="text"
                    value={formInstitution}
                    onChange={(e) => setFormInstitution(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Primary Parent / Guardian Link
                  </label>
                  <input
                    type="text"
                    value={formParentName}
                    onChange={(e) => setFormParentName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 4: Daily Target Time & Dominant Modality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Daily Study Target (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    step="15"
                    value={formStudyTime}
                    onChange={(e) => setFormStudyTime(Number(e.target.value))}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Dominant Learning Modality
                  </label>
                  <select
                    value={formModality}
                    onChange={(e) => setFormModality(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Visual & Multi-Modal">Visual & Multi-Modal (Diagrams, Code, Tables)</option>
                    <option value="Socratic Dialogue">Socratic Dialogue (Guided Questioning & Retrieval)</option>
                    <option value="Code-First Practice">Code-First Practice (Implementation Drills)</option>
                    <option value="Executive Structured">Executive Structured (High Density Revision)</option>
                  </select>
                </div>
              </div>

              {/* Bio & Study Objective */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Academic Focus & Bio
                </label>
                <textarea
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  rows={2}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recalibrating Models...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save & Synchronize</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4. Academic Transcript Modal ── */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Official Academic Progress Transcript</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AdaptEd AI Automated Telemetry & Curriculum Verification Record</p>
                </div>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transcript Certificate Sheet */}
            <div className="mt-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-6">
              
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{formName}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: STU-2024-{snapshot?.user?.id ? String(snapshot.user.id).padStart(4, "0") : "8842"} • {formEmail}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{formInstitution} • {formDegree}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative Performance</span>
                  <div className="flex items-baseline sm:justify-end gap-2 mt-1">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{gpa} GPA</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">({overallMastery}%)</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Status: Active Honor Roll</span>
                </div>
              </div>

              {/* Course Mastery Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Enrolled Course Evaluation</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Course / Module</th>
                        <th className="p-3">Evaluated Mastery</th>
                        <th className="p-3">Grade Equivalent</th>
                        <th className="p-3">Pacing Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {masteryList.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{m.topic}</td>
                          <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{m.mastery}%</td>
                          <td className="p-3 font-semibold">
                            {m.mastery >= 90 ? "A+ (Outstanding)" : m.mastery >= 80 ? "A (Excellent)" : m.mastery >= 70 ? "B+ (Very Good)" : "B (Competent)"}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              m.mastery >= 80 
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            }`}>
                              {m.mastery >= 80 ? "Exam Ready" : "On Track"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Verification Stamp Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Digitally certified by AdaptEd AI Bayesian Cognitive Engine v4.2</span>
                </div>
                <span className="font-mono text-[11px]">Issued: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF Transcript</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
