"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi, setToken } from "@/lib";
import Link from "next/link";
import {
  Brain, Target, Network, Code2, MessageSquare, HeartHandshake,
  CheckCircle2, Eye, EyeOff, ArrowRight, Moon, Sun, GraduationCap, Users,
  Sparkles, Lock, Mail, User, Star
} from "lucide-react";

const features = [
  { icon: MessageSquare, label: "6 Adaptive Learning Modes", desc: "Socratic, ELI5, Exam Prep, Interview & real-time audio" },
  { icon: Brain, label: "Smart Syllabus RAG", desc: "Upload course PDFs and lecture slides for cited answers" },
  { icon: Code2, label: "AI Coding Challenges", desc: "Dynamic Python tests targeted directly at your weak spots" },
  { icon: Target, label: "Continuous Mastery Path", desc: "Interactive roadmap unlocking topics at 70% threshold" },
  { icon: Network, label: "Interactive Diagram Studio", desc: "Generate massive mindmaps & flowcharts on the fly" },
  { icon: HeartHandshake, label: "Parent Telemetry Portal", desc: "Weekly AI progress reports & live study audit trails" },
];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchApi("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      setToken(data.access_token);
      router.push(role === "parent" ? "/parent-dashboard" : "/onboarding");
    } catch (err) {
      setError(err.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">

      {/* ── LEFT PANEL: Information & Features (50% Width) ── */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-slate-900 text-white p-8 lg:p-12 pt-6 lg:pt-8 relative overflow-hidden flex-shrink-0 justify-between">
        
        {/* Animated Glow Background Blobs */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-blob pointer-events-none"></div>
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:bg-white/25 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 7 9.5v-3.8a2 2 0 0 1 .6-1.4l1.4-1.3"></path>
                  <path d="M12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                  <path d="M18 10a6 6 0 0 1-4.8 5.9"></path>
                  <circle cx="19" cy="19" r="3"></circle>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-white leading-none">
                  AdaptEd<span className="text-indigo-200">.AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-indigo-200 mt-1">by SkillMatix</span>
              </div>
            </Link>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-100 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Adaptive Engine • Free</span>
            </div>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight mt-6">
            The learning journey that <br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              adapts to you.
            </span>
          </h1>

          <p className="text-indigo-100/90 text-sm xl:text-base leading-relaxed max-w-lg mt-2.5">
            Turn your study notes into an intelligent tutor that mathematically diagnoses knowledge gaps and tunes practice difficulty in real-time.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="relative z-10 my-5 space-y-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                style={{ transitionDelay: `${i * 50}ms` }}
                className={`flex items-start gap-3.5 p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:translate-x-1.5 cursor-default ${
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white tracking-wide">{f.label}</div>
                  <div className="text-indigo-200/90 text-xs mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Student Testimonial Quote */}
        <div className="relative z-10 pt-4 border-t border-white/15">
          <div className="flex items-center gap-1 text-amber-300 mb-1.5">
            <Star className="w-4 h-4 fill-amber-300" />
            <Star className="w-4 h-4 fill-amber-300" />
            <Star className="w-4 h-4 fill-amber-300" />
            <Star className="w-4 h-4 fill-amber-300" />
            <Star className="w-4 h-4 fill-amber-300" />
            <span className="text-xs text-indigo-100 font-semibold ml-1.5">4.9/5 Student & Parent Rating</span>
          </div>
          <p className="text-indigo-100 text-xs xl:text-sm italic leading-relaxed">
            "Before AdaptEd AI, questions were either too easy or made no sense. Now, practice adjusts exactly to where I stumble. My GPA jumped from 3.1 to 3.8."
          </p>
          <p className="text-white text-xs font-semibold mt-1">Aarav Sharma — Engineering Undergraduate</p>
        </div>

      </div>

      {/* ── RIGHT PANEL: Large, Block-Fitting Form (50% Width) ── */}
      <div className="flex flex-col flex-1 w-full lg:w-1/2 min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200 overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-12 py-3.5 border-b border-slate-100 dark:border-slate-800">
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 7 9.5v-3.8a2 2 0 0 1 .6-1.4l1.4-1.3"></path>
                <path d="M12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                <circle cx="19" cy="19" r="3"></circle>
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">AdaptEd.AI</span>
          </Link>
          <div className="hidden lg:block"></div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Large, Block-Fitting Form Container: ALIGNED TO TOP */}
        <div className="flex-1 flex flex-col justify-start pt-5 sm:pt-7 pb-10 px-6 sm:px-12 lg:px-16 w-full max-w-xl mx-auto">
          <div className={`transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>

            {/* Form Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold mb-2.5">
                <Sparkles className="w-4 h-4" />
                <span>100% Free Forever • No Credit Card Required</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Create your account
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1.5">
                Start your continuous personalized learning journey today.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="mb-4">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                I AM SIGNING UP AS:
              </Label>
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-3.5 px-5 rounded-2xl border-2 text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
                    role === "student"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  <GraduationCap className={`w-5 h-5 ${role === "student" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("parent")}
                  className={`py-3.5 px-5 rounded-2xl border-2 text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
                    role === "parent"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  <Users className={`w-5 h-5 ${role === "parent" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                  <span>Parent</span>
                </button>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <Label htmlFor="name" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    id="name"
                    placeholder="e.g. Riya Sharma"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 transition-all text-base"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 transition-all text-base"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 transition-all text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Interactive Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 transition-all">
                    <div className="flex gap-2 h-1.5">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            strength > step ? strengthColors[strength - 1] : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Strength: <strong className="text-slate-700 dark:text-slate-200">{strengthLabels[strength - 1] || "Too short"}</strong></span>
                      <span>8+ characters recommended</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-4 py-3 rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-13 text-base sm:text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2.5">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Start Learning for Free
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </span>
                )}
              </Button>
            </form>

            {/* Bottom Perks Grid */}
            <div className="mt-7 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>FERPA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Dynamic Practice Loop</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
