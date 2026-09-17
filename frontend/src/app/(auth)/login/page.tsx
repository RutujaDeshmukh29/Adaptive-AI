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
  CheckCircle2, Eye, EyeOff, ArrowRight, Moon, Sun, Lock, Mail,
  Sparkles, Star, ShieldCheck, GraduationCap, KeyRound, Users
} from "lucide-react";

const highlights = [
  { icon: Target, label: "Resume Mastery Path", desc: "Pick up right where you left off on your personalized topic tree" },
  { icon: Brain, label: "Your Grounded Notes", desc: "Instantly query all previously uploaded textbooks and lecture slides" },
  { icon: Code2, label: "Daily Coding Sets", desc: "Continue practicing targeted challenges calibrated to your weak spots" },
  { icon: HeartHandshake, label: "Telemetry & Audit Logs", desc: "Students track mastery curves; parents inspect weekly progress summaries" },
];

export default function Login() {
  const [loginTab, setLoginTab] = useState<"student" | "parent">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [parentKey, setParentKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi<{ access_token: string; onboarding_complete: boolean; user: { role?: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.access_token);

      if (data.user?.role === "parent") {
        router.push("/parent-dashboard");
      } else if (data.onboarding_complete) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi<{ access_token: string; onboarding_complete: boolean; user: { role?: string; id: number } }>("/api/auth/parent-login", {
        method: "POST",
        body: JSON.stringify({
          student_name: studentName.trim(),
          parent_key: parentKey.trim().toUpperCase(),
        }),
      });

      setToken(data.access_token);
      router.push("/parent-dashboard");
    } catch (err: any) {
      setError(err.detail || "Invalid Student Name or Parent Sync Key. Please verify the sync key provided by the student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">

      {/* ── LEFT PANEL: Information & Highlights (50% Width) ── */}
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
              <span>Live Adaptive Engine • Ready</span>
            </div>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight mt-6">
            Welcome back to <br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              continuous learning.
            </span>
          </h1>

          <p className="text-indigo-100/90 text-sm xl:text-base leading-relaxed max-w-lg mt-2.5">
            Log in to access your continuous learner model, ongoing coding sprints, and syllabus-grounded AI doubts.
          </p>
        </div>

        {/* Highlights List */}
        <div className="relative z-10 my-6 space-y-3.5">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div 
                key={i} 
                style={{ transitionDelay: `${i * 60}ms` }}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:translate-x-1.5 cursor-default ${
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white tracking-wide">{h.label}</div>
                  <div className="text-indigo-200/90 text-xs mt-0.5 leading-relaxed">{h.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonial Quote */}
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
            "The continuous recalibration saved me dozens of hours of study time before midterm exams. It knows exactly what formula I need to review."
          </p>
          <p className="text-white text-xs font-semibold mt-1">Nandini Kulkarni — Parent of High School Junior</p>
        </div>

      </div>

      {/* ── RIGHT PANEL: Large, Block-Fitting Login Form (50% Width) ── */}
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
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Large, Block-Fitting Form Container: ALIGNED TO TOP */}
        <div className="flex-1 flex flex-col justify-start pt-6 sm:pt-8 pb-10 px-6 sm:px-12 lg:px-16 w-full max-w-xl mx-auto">
          <div className={`transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>

            {/* Form Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold mb-2.5">
                <Sparkles className="w-4 h-4" />
                <span>Secure Adaptive Learning Portal</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {loginTab === "student" ? "Student Sign In" : "Parent Portal Sign In"}
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1.5">
                {loginTab === "student"
                  ? "Enter your credentials to continue your learning journey."
                  : "Enter student credentials and Parent Sync Key to view live reports."}
              </p>
            </div>

            {/* Segmented Switcher: Student vs Parent */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 mb-6">
              <button
                type="button"
                onClick={() => { setLoginTab("student"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  loginTab === "student"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>🎓 Student Login</span>
              </button>

              <button
                type="button"
                onClick={() => { setLoginTab("parent"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  loginTab === "parent"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>👨‍👩‍👧 Parent Login</span>
              </button>
            </div>

            {/* STUDENT LOGIN FORM */}
            {loginTab === "student" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                
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
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                      Password
                    </Label>
                    <button 
                      type="button" 
                      onClick={() => alert("Password reset link will be sent to your registered email.")} 
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    Keep me signed in on this device
                  </label>
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
                  className="w-full h-13 text-base sm:text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-3 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2.5">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In to Dashboard
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              /* PARENT LOGIN FORM */
              <form onSubmit={handleParentLogin} className="space-y-4">
                
                {/* Information Banner */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Passwordless Parent Access:</strong> Enter your student&apos;s username and their unique <strong>Parent Sync Key</strong> (from the student&apos;s portal) to securely access live study telemetry and weekly progress.
                  </div>
                </div>

                {/* Student Name / Username */}
                <div>
                  <Label htmlFor="studentName" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Student Name / Username
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <Input
                      id="studentName"
                      type="text"
                      placeholder="e.g. Rutuja or Aarav Sharma"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 transition-all text-base"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Enter the student&apos;s name or registered email address
                  </p>
                </div>

                {/* Parent Sync Key */}
                <div>
                  <Label htmlFor="parentKey" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Parent Sync Key
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <Input
                      id="parentKey"
                      type="text"
                      placeholder="e.g. PAR-0001 or STUDENT-0001"
                      required
                      value={parentKey}
                      onChange={(e) => setParentKey(e.target.value)}
                      className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 font-mono transition-all text-base tracking-wider"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Unique key provided by the student from the Parent Portal in their panel
                  </p>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberParent"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                  />
                  <label htmlFor="rememberParent" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    Keep me signed in to student dashboard
                  </label>
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
                  className="w-full h-13 text-base sm:text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-3 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2.5">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Verifying sync key...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Connect to Student Progress
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </span>
                  )}
                </Button>
              </form>
            )}

            {/* Bottom Perks Grid */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Encrypted Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Instant State Recovery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>FERPA & COPPA Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>24/7 AI Availability</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
