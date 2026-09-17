"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { 
  ArrowRight, ArrowUp, Check, X, Star, Sparkles, Play, 
  Moon, Sun
} from "lucide-react";

// --- Scroll Pop-Up Animation Wrapper ---
function ScrollReveal({ 
  children, 
  delay = 0, 
  className = "",
  pop = true
}: { 
  children: ReactNode; 
  delay?: number; 
  className?: string;
  pop?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
          : pop 
            ? "opacity-0 translate-y-12 scale-[0.96] pointer-events-none" 
            : "opacity-0 translate-y-10 pointer-events-none"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = saved === "dark" || (!saved && prefersDark);
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [router]);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (checking) return null;

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-950 dark:selection:text-indigo-200 transition-colors duration-200 relative">
      
      {/* BEGIN: TopNavigationBar */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link aria-label="AdaptEd AI Home" className="flex items-center gap-3 group" href="/">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 7 9.5v-3.8a2 2 0 0 1 .6-1.4l1.4-1.3"></path>
                <path d="M12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                <path d="M18 10a6 6 0 0 1-4.8 5.9"></path>
                <circle cx="19" cy="19" r="3"></circle>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                AdaptEd<span className="text-indigo-600 dark:text-indigo-400">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 mt-1">by SkillMatix</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Desktop Navigation" className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#problem-solution">Why AdaptEd</a>
            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#how-it-works">How It Works</a>
            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#experience">Student Experience</a>
            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#parent-portal">Parent Portal</a>
            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#tech-stack">Architecture</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1" href="/login">
              Sign In
            </Link>

            <Link className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all duration-150" href="/signup">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>
      {/* END: TopNavigationBar */}

      {/* BEGIN: HeroSection */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 grid-pattern gradient-glow overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Headline & Pitch Content */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            
            {/* Trust Pill */}
            <ScrollReveal delay={50}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                <span>100% Free EdTech • Powered by Gemini AI & Vector RAG</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                The Learning Journey That <span className="text-indigo-600 dark:text-indigo-400">Adapts to You</span>, Not the Other Way Around.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                Instead of rigid static study plans, AdaptEd AI continuously diagnoses your mastery, bridges conceptual gaps in real time, and personalizes every practice question and AI explanation.
              </p>
            </ScrollReveal>

            {/* CTA Group */}
            <ScrollReveal delay={350}>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition" 
                  href="/signup"
                >
                  Start Learning for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                <Link 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl shadow-sm transition" 
                  href="/login"
                >
                  <Play className="w-4 h-4 mr-2 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                  Explore Live Demo
                </Link>
              </div>
            </ScrollReveal>

            {/* Social Proof Stats */}
            <ScrollReveal delay={450}>
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <span className="inline-block h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300">AK</span>
                    <span className="inline-block h-7 w-7 rounded-full bg-indigo-200 dark:bg-indigo-900 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[10px] text-indigo-700 dark:text-indigo-300">SR</span>
                    <span className="inline-block h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[10px] text-indigo-600 dark:text-indigo-400">ML</span>
                  </div>
                  <span>Trusted across <strong>40+ leading institutions</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 flex items-center">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">4.9/5</span>
                  <span>Student & Parent rating</span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full font-medium text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  100% Free • No Credit Card Required
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Hero Visual: Clean Interactive Engine Mockup */}
          <ScrollReveal delay={550} pop={true}>
            <div className="max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-5 sm:p-8 hover:shadow-2xl transition-all duration-300">
              
              {/* Mockup Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">workspace / adaptive-runtime-v3.session</span>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Loop: Dynamic Recalibration Active
                </div>
              </div>

              {/* Inner Split: Knowledge State + Real-time Assistant */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                
                {/* Left: Dynamic Learner Model Status */}
                <div className="lg:col-span-5 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Continuous Learner Model</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">Bayesian Tracker</span>
                    </div>

                    {/* Topic Progress Indicators */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-slate-700 dark:text-slate-300">Calculus: Optimization & Derivatives</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">88% Mastered</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full w-[88%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-slate-700 dark:text-slate-300">Linear Algebra: Eigenvectors</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Gap Detected (42%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full w-[42%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-slate-700 dark:text-slate-300">Vector Calculus: Green&#39;s Theorem</span>
                          <span className="text-slate-500 dark:text-slate-400">Calibrating next...</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-300 dark:bg-indigo-700 h-full rounded-full w-[15%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Adjustment Badge */}
                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Current Caliber Level:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md shadow-xs">
                      Level 2.8 <span className="text-indigo-600 dark:text-indigo-400">→ 3.2 Dynamic</span>
                    </span>
                  </div>
                </div>

                {/* Right: Interactive AI Assistant & Adaptive Practice Teaser */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  
                  {/* Simulated AI Dialogue */}
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">You</div>
                      <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-3 rounded-2xl rounded-tl-none leading-relaxed">
                        &quot;I don&#39;t understand why the determinant being zero means no unique inverse in Step 3 of this problem.&quot;
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">AI</div>
                      <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200 p-3.5 rounded-2xl rounded-tl-none leading-relaxed">
                        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Grounded in your uploaded lecture notes: <em>Prof_Math_Week4.pdf (p.14)</em>
                        </div>
                        When determinant = 0, the linear transformation collapses dimension (squashing 2D into a 1D line or point). You can&#39;t reverse a collapse uniquely!
                        
                        <div className="mt-2.5 pt-2 border-t border-indigo-100/70 dark:border-indigo-900/70 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                          <span>Generated 1 micro-quiz to solidify this concept?</span>
                          <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md transition text-xs font-semibold">
                            Try Micro-Quiz
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Footnote inside Mockup */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>ChromaDB Vector Retrieval: 32ms</span>
                    <span>Gemini 1.5 Pro Context Pipeline Active</span>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: ProblemVsSolutionSection */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800" id="problem-solution">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                Evolutionary Shift
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
                The Problem with Traditional EdTech vs. AdaptEd AI
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                Most platforms provide static video libraries or generic question banks. Here is how continuous adaptation changes the paradigm.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* The Problem Card */}
            <ScrollReveal delay={100} pop={true}>
              <div className="h-full bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-8 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Traditional Learning Platforms</h3>
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">The &quot;One-Size-Fits-None&quot; Trap</p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                    <span><strong>Static Study Plans:</strong> Schedules created on Day 1 that never adjust when a student gets stuck or moves faster.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                    <span><strong>Invisible Learning Gaps:</strong> Students pass basic tests while deep foundational prerequisites remain unresolved.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                    <span><strong>Identical Practice for Everyone:</strong> High-achievers get bored with easy questions while struggling students get overwhelmed.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                    <span><strong>Generic AI Chatbots:</strong> Hallucinating assistants that give general textbook answers unrelated to your professor&#39;s specific curriculum.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* The AdaptEd AI Solution Card */}
            <ScrollReveal delay={250} pop={true}>
              <div className="h-full bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">AdaptEd AI by SkillMatix</h3>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Continuous Adaptive Learning Intelligence</p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">✓</span>
                    <span><strong>Dynamic Learner Profile:</strong> Automatically updates skill confidence ratings with every single question answered.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">✓</span>
                    <span><strong>Instant Gap Remediation:</strong> If you struggle with a question, the platform pinpoints the prerequisite formula immediately.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">✓</span>
                    <span><strong>Calibrated Practice Difficulty:</strong> Practice sets dynamically scale from Level 1 foundational to Level 5 mastery based on response speed and precision.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">✓</span>
                    <span><strong>100% Courseware-Grounded RAG:</strong> AI explanations cite exact paragraphs and formulas from your uploaded lecture slides and notes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">✓</span>
                    <span><strong>Completely Free Access:</strong> 100% free for all students and parents with no paywalls, subscriptions, or credit card required.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>
      {/* END: ProblemVsSolutionSection */}

      {/* BEGIN: HowItWorksSection */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                The Technical Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
                The 6-Step Continuous Adaptive Loop
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                Instead of generating a static study plan once, AdaptEd AI continually updates learner models as students progress.
              </p>
            </div>
          </ScrollReveal>

          {/* 6-Step Grid with Staggered Pop-Up */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Step 1: Assess */}
            <ScrollReveal delay={100} pop={true}>
              <div className="h-full bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-5">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. ASSESS</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Quick AI diagnostic tests uncover micro-competencies, current conceptual grasp, and prior knowledge baseline.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Diagnostic Diagnostic Matrix
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2: Profile */}
            <ScrollReveal delay={200} pop={true}>
              <div className="h-full bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-5">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. PROFILE</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Constructs a multi-dimensional Dynamic Learner Profile recording cognitive preferences, response speeds, and retention velocity.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Real-Time Learner Model
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3: Personalize */}
            <ScrollReveal delay={300} pop={true}>
              <div className="h-full bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-5">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. PERSONALIZE</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Curates a customized trajectory of next topics, prioritizing weak foundational prerequisites before advanced challenges.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  Algorithmic Path Generation
                </div>
              </div>
            </ScrollReveal>

            {/* Step 4: Learn */}
            <ScrollReveal delay={150} pop={true}>
              <div className="h-full bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-5">
                    04
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. LEARN</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Engage with our Multimodal AI Study Assistant grounded directly in your syllabus via ChromaDB embeddings & Gemini 1.5.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  RAG Content Engine
                </div>
              </div>
            </ScrollReveal>

            {/* Step 5: Measure */}
            <ScrollReveal delay={250} pop={true}>
              <div className="h-full bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-sm mb-5">
                    05
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. MEASURE</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Solve adaptive micro-practice sets where question caliber modulates dynamically based on accuracy and time-to-solve.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Dynamic Practice Engine
                </div>
              </div>
            </ScrollReveal>

            {/* Step 6: Adapt */}
            <ScrollReveal delay={350} pop={true}>
              <div className="h-full bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold text-sm mb-5">
                    06
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">6. ADAPT</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    The feedback loop closes: performance data updates the student profile, continuously rerouting the next best learning step.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Self-Refining Loop
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>
      {/* END: HowItWorksSection */}

      {/* BEGIN: FeatureDeepDives */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800" id="experience">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Feature 1: Student Study Assistant with RAG */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal delay={100}>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
                  For Students
                </div>

                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Ask doubts grounded directly in your syllabus and notes.
                </h3>

                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Generic LLMs hallucinate or provide solutions in notation you never learned. AdaptEd AI&#39;s Retrieval Augmented Generation (RAG) vectorizes your university textbooks, assignments, and uploaded PDF notes.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">✓</span>
                    Direct citations to exact slide numbers & textbook pages
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">✓</span>
                    Socratic step-by-step guidance rather than instant spoon-feeding
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">✓</span>
                    Automatic generation of related follow-up practice problems
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Student Graphic Card */}
            <ScrollReveal delay={250} pop={true}>
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Target Document: CS201_Algorithms_Midterm.pdf</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Parsed with PyMuPDF</span>
                  </div>
                  <div className="mt-4 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    Chunk Embedding: [0.024, -0.198, 0.451, ...]<br />
                    Similarity Match: 98.4% (Dijkstra vs A* heuristics)
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-800 dark:text-slate-200">
                    <strong>AI Answer:</strong> &quot;In your professor&#39;s notation on slide 22, the heuristic function h(n) must be admissible (it can never overestimate the true cost)...&quot;
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Feature 2: Parent Portal & Live Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center" id="parent-portal">
            
            {/* Parent Graphic Card */}
            <ScrollReveal delay={150} pop={true} className="order-2 lg:order-1">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">Active Student Session</p>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">Rohan S. • Grade 11</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Studying Now
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Current Module:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">Organic Chemistry: Carbonyls</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Session Focus Time:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">42 minutes</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Accuracy on Level 3 questions:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">85% (3/4 correct)</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Weekly summary emailed every Sunday at 6:00 PM. No nagging required.
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={250} className="order-1 lg:order-2">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
                  For Parents & Mentors
                </div>

                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Real clarity without the stressful interrogation.
                </h3>

                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Stop asking &quot;Did you study today?&quot; and see actual conceptual progression. AdaptEd AI provides parents and mentors with non-intrusive, constructive visibility into learning effort and mastery trends.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                    Zero guesswork on upcoming exams & preparedness indicators
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                    Actionable milestone updates rather than raw, unhelpful percentages
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                    Shared mentor comments to celebrate breakthroughs and consistent habits
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>
      {/* END: FeatureDeepDives */}

      {/* BEGIN: TechArchitectureSection */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800" id="tech-stack">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
                Enterprise Grade
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                Engineered on Modern AI Infrastructure
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Robust, low-latency, and strictly partitioned per institution and student.
              </p>
            </div>
          </ScrollReveal>

          {/* Tech Badges Flow with Staggered Pop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Gemini API", desc: "Multimodal Reasoning", delay: 100 },
              { name: "ChromaDB", desc: "Vector Store & Embeddings", delay: 160 },
              { name: "PyMuPDF", desc: "Fast Document Parsing", delay: 220 },
              { name: "Sentence Transformers", desc: "Semantic Matching", delay: 280 },
              { name: "FastAPI & Python", desc: "Low-Latency Backend", delay: 340 },
              { name: "Next.js & React", desc: "Reactive Modern UI", delay: 400 },
            ].map((tech, idx) => (
              <ScrollReveal key={idx} delay={tech.delay} pop={true}>
                <div className="h-full bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold text-base mb-1">{tech.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{tech.desc}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>
      {/* END: TechArchitectureSection */}

      {/* BEGIN: TestimonialsSection */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                Real Results
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
                Loved by Students, Trusted by Parents
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1: Student */}
            <ScrollReveal delay={100} pop={true}>
              <div className="h-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  &quot;Before AdaptEd AI, I would do 50 practice problems and half were too easy, while the other half made no sense. Now, the questions adjust right to where I&#39;m stumbling. My GPA jumped from 3.1 to 3.8.&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                    AS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aarav Sharma</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Engineering Undergraduate</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Testimonial 2: Parent */}
            <ScrollReveal delay={200} pop={true}>
              <div className="h-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  &quot;The Parent Portal is a breath of fresh air. I can see my daughter&#39;s actual growth in Physics without hovering over her shoulder. The weekly progress digests show true conceptual mastery.&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                    NK
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nandini Kulkarni</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Parent of High School Junior</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Testimonial 3: Educator */}
            <ScrollReveal delay={300} pop={true}>
              <div className="h-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  &quot;AdaptEd AI handles the heavy diagnostic lifting. It pinpoints exactly which foundational formula a student is missing so my tutoring sessions can be 100% high-impact intervention.&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                    DM
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dr. Marcus Vance</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">STEM Academic Mentor</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>
      {/* END: TestimonialsSection */}

      {/* BEGIN: CallToActionBanner */}
      <section className="py-20 bg-indigo-900 dark:bg-indigo-950 text-white relative overflow-hidden" id="get-started">
        {/* Subtle background circle decorations */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-800/40 pointer-events-none blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-indigo-700/30 pointer-events-none blur-3xl"></div>

        <ScrollReveal pop={true}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-800/80 border border-indigo-700 text-indigo-200 text-xs font-semibold mb-6">
              Start Transforming Your Study Sessions
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to experience education that adapts to you?
            </h2>

            <p className="mt-4 text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto font-normal">
              Join thousands of students and parents moving past rigid study schedules. AdaptEd AI is completely free to use with zero hidden costs or subscriptions.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-indigo-950 bg-white hover:bg-slate-100 rounded-xl shadow-lg hover:scale-105 transition duration-150" 
                href="/signup"
              >
                Get Started Free — 100% Free
              </Link>

              <Link 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white border border-indigo-500 hover:bg-indigo-800/60 rounded-xl hover:scale-105 transition duration-150" 
                href="/login"
              >
                Explore Live Demo
              </Link>
            </div>

            <p className="mt-6 text-xs text-indigo-300">
              100% Free Forever • No Subscription • No Credit Card Required • FERPA & Student Data Privacy Compliant
            </p>
          </div>
        </ScrollReveal>
      </section>
      {/* END: CallToActionBanner */}

      {/* BEGIN: MainFooter */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand Summary */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base">A</div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">AdaptEd.AI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                AdaptEd AI (by SkillMatix) delivers continuous adaptive learning loops powered by generative AI, RAG pipelines, and dynamic knowledge tracing.
              </p>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Engineered for high schools, universities, and competitive exams.
              </div>
            </div>

            {/* Column 1 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#how-it-works">Adaptive Engine</a></li>
                <li><a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#experience">RAG Lecture Bot</a></li>
                <li><a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#how-it-works">Diagnostic Tests</a></li>
                <li><a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#how-it-works">Dynamic Calibration</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Solutions</h4>
              <ul className="space-y-2 text-xs">
                <li><a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#experience">Higher Education</a></li>
                <li><a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#experience">K-12 STEM Prep</a></li>
                <li><a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#parent-portal">Parent Portals</a></li>
                <li><Link className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="/signup">Free Student & Tutor Access</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Company & Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-500 dark:text-slate-400">SkillMatix Group</span></li>
                <li><span className="text-slate-500 dark:text-slate-400">Privacy Policy</span></li>
                <li><span className="text-slate-500 dark:text-slate-400">Terms of Service</span></li>
                <li><span className="text-slate-500 dark:text-slate-400">Security Architecture</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
            <p>© 2026 AdaptEd AI by SkillMatix. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <span>Privacy</span>
              <span>Terms</span>
              <span>FERPA / COPPA</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Operational</span>
              <button 
                onClick={scrollToTop}
                className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium ml-2 cursor-pointer"
                title="Scroll back to top"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </footer>
      {/* END: MainFooter */}

      {/* Floating Go-To-Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className={`fixed bottom-8 right-8 z-50 p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center border border-indigo-400/20 cursor-pointer ${
          showScrollTop 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
            : "opacity-0 translate-y-6 scale-75 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5]" />
      </button>

    </div>
  );
}
