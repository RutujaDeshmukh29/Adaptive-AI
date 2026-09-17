"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { 
  Send, FileText, Loader2, Sparkles, Brain, 
  HelpCircle, Baby, GraduationCap, Code2, Briefcase, 
  ArrowRight, Lightbulb, Network, Mic, MicOff, Volume2, VolumeX,
  History, Plus, Trash2, Clock, MessageSquare, ArrowUp,
  PanelRightClose, PanelRight, ChevronRight, Copy, Check,
  BookOpen, Bookmark, Target, Play, Paperclip, RefreshCw, X
} from "lucide-react";
import { fetchApi } from "@/lib";
import { 
  ChatResponse, ChatSource, LearningMode, 
  ChatSessionSummary, ChatSessionsResponse, ChatHistoryResponse 
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import ReactMarkdown from 'react-markdown';
import { MermaidViewer } from "@/components/ui/mermaid-viewer";
import Link from "next/link";

interface ModeConfig {
  id: LearningMode;
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderActive: string;
  starterPrompts: string[];
}

const LEARNING_MODES: ModeConfig[] = [
  {
    id: "adaptive",
    name: "Adaptive Tutor",
    shortLabel: "Adaptive",
    tagline: "Calibrated & Grounded",
    description: "Personalized to your mastery score, goal, and course notes.",
    icon: Brain,
    color: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    borderActive: "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs",
    starterPrompts: [
      "Explain how attention scaling by sqrt(d_k) prevents vanishing gradients.",
      "Can you walk through vector embeddings and cosine similarity?",
      "Summarize the key theorems from my uploaded lecture slides."
    ]
  },
  {
    id: "socratic",
    name: "Socratic Guide",
    shortLabel: "Socratic",
    tagline: "Guided Discovery",
    description: "Guides you with probing questions and hints instead of plain answers.",
    icon: HelpCircle,
    color: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    borderActive: "border-purple-600 bg-purple-50/70 text-purple-900 shadow-xs",
    starterPrompts: [
      "Why does cross-entropy loss penalize confident wrong predictions?",
      "What happens to local variables when a recursive call returns?",
      "How should I reason about time complexity in dynamic programming?"
    ]
  },
  {
    id: "eli5",
    name: "ELI5",
    shortLabel: "ELI5",
    tagline: "Everyday Metaphors",
    description: "Uses playful real-world analogies with zero unexplained jargon.",
    icon: Baby,
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    borderActive: "border-amber-600 bg-amber-50/70 text-amber-900 shadow-xs",
    starterPrompts: [
      "Explain multi-head attention like I am 5 years old.",
      "How does a neural network learn using a radio tuning metaphor?",
      "What is a vector database in simple everyday terms?"
    ]
  },
  {
    id: "exam",
    name: "Exam & Viva Prep",
    shortLabel: "Exam Prep",
    tagline: "High-Yield Formal Points",
    description: "Formal definitions, scoring bullet points, and expected viva questions.",
    icon: GraduationCap,
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    borderActive: "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs",
    starterPrompts: [
      "What are the 4 key differences between BERT and GPT for exams?",
      "Give me a 5-mark formal answer for backpropagation chain rule.",
      "What tricky viva questions can professors ask about transformers?"
    ]
  },
  {
    id: "code",
    name: "Code-First",
    shortLabel: "Code-First",
    tagline: "Executable Implementations",
    description: "Leads with clean, working code snippets and sample console tests.",
    icon: Code2,
    color: "text-cyan-600 dark:text-cyan-400",
    bgLight: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
    borderActive: "border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-xs",
    starterPrompts: [
      "Write a clean PyTorch scaled dot-product attention function with comments.",
      "Show a working custom generator function with edge-case handling.",
      "Write a Python script to compute cosine similarity between two tensors."
    ]
  },
  {
    id: "interview",
    name: "Tech Interview",
    shortLabel: "Interview",
    tagline: "Big-O & System Traps",
    description: "Focuses on time/space complexity, scalability, and FAANG traps.",
    icon: Briefcase,
    color: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    borderActive: "border-rose-600 bg-rose-50/70 text-rose-900 shadow-xs",
    starterPrompts: [
      "How do hash tables achieve O(1) average lookup and avoid collisions?",
      "Compare time and space complexity of DFS vs BFS on sparse graphs.",
      "What is the memory bottleneck in large transformer inference (KV Cache)?"
    ]
  }
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  mode?: LearningMode;
  sources?: ChatSource[];
  learnerContext?: any;
}

function cleanMarkdownForSpeech(text: string): string {
  return text
    .replace(/```mermaid[\s\S]*?```/gi, " [diagram omitted] ")
    .replace(/```[\s\S]*?```/gi, " [code snippet omitted] ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~#>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function AssistantContent() {
  const [selectedMode, setSelectedMode] = useState<LearningMode>("adaptive");
  const [sessionId, setSessionId] = useState<string>(() => `sess_${Date.now()}`);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // User Profile & Context
  const [currentTopicName, setCurrentTopicName] = useState<string>("Transformers & Attention");
  const [caliberScore, setCaliberScore] = useState<string>("3.2");

  // Chat conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      timestamp: "Just now",
      content: "Hello! I am your AI Chat Assistant, grounded directly in your uploaded notes and Caliber 3.2 syllabus.\n\nAsk me any concept, request an algebraic derivation, or ask for a **Mermaid diagram** of any machine learning architecture!",
      mode: "adaptive"
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeModeConfig = LEARNING_MODES.find(m => m.id === selectedMode) || LEARNING_MODES[0];

  // Load user profile context
  useEffect(() => {
    async function loadUserContext() {
      try {
        const profile = await fetchApi<any>("/api/profile");
        if (profile?.current_topic?.name) {
          setCurrentTopicName(profile.current_topic.name);
        } else if (profile?.subject) {
          setCurrentTopicName(profile.subject);
        }
        if (profile?.overall_mastery !== undefined) {
          setCaliberScore((profile.overall_mastery / 25).toFixed(1));
        }
      } catch (e) {
        console.warn("Could not load user context for chat assistant:", e);
      }
    }
    loadUserContext();
  }, []);

  // Fetch session history list
  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetchApi<ChatSessionsResponse>("/api/chat/sessions");
      if (res && res.sessions) {
        setSessions(res.sessions);
      }
    } catch (e) {
      console.warn("Failed to load chat sessions:", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const selectSession = async (targetSessionId: string) => {
    if (loadingHistory || targetSessionId === sessionId) return;
    try {
      setLoadingHistory(true);
      const res = await fetchApi<ChatHistoryResponse>(`/api/chat/history?session_id=${encodeURIComponent(targetSessionId)}`);
      if (res && res.messages && res.messages.length > 0) {
        setMessages(res.messages.map((m, i) => ({
          id: m.id ? m.id.toString() : `hist_${i}`,
          role: m.role,
          content: m.content,
          timestamp: m.created_at || "Recent",
          sources: m.sources,
          mode: selectedMode
        })));
        setSessionId(targetSessionId);
      }
    } catch (e) {
      console.error("Failed to load session history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setSessionId(newId);
    setMessages([
      {
        id: `init_${Date.now()}`,
        role: "assistant",
        timestamp: "Just now",
        content: `New session started. How can I help you master **${currentTopicName}** today? Ask questions, request derivations, or explore practice drills.`,
        mode: selectedMode
      }
    ]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear this conversation?")) {
      handleNewChat();
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, targetSessionId: string) => {
    e.stopPropagation();
    try {
      await fetchApi(`/api/chat/clear?session_id=${encodeURIComponent(targetSessionId)}`, {
        method: "DELETE"
      });
      setSessions(prev => prev.filter(s => s.session_id !== targetSessionId));
      if (sessionId === targetSessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Speech Recognition & TTS setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (msgId: string, content: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = cleanMarkdownForSpeech(content);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);
    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (msgId: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: textToSend,
      timestamp: timeStr,
      mode: selectedMode 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await fetchApi<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ 
          message: userMessage.content,
          mode: selectedMode,
          session_id: sessionId
        }),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: timeStr,
        mode: selectedMode,
        sources: data.sources,
        learnerContext: data.learner_context_used
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      loadSessions();
    } catch (err: any) {
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: "assistant", 
          timestamp: timeStr,
          content: `Unable to retrieve response: ${err.detail || "Server connection timed out."}`,
          mode: selectedMode 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract all active sources from the conversation
  const activeSources: ChatSource[] = [];
  messages.forEach(m => {
    if (m.sources && m.sources.length > 0) {
      m.sources.forEach(s => {
        if (!activeSources.some(ex => ex.filename === s.filename && ex.page === s.page)) {
          activeSources.push(s);
        }
      });
    }
  });

  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Top Header Strip (Matching Design Template) */}
      <ScrollReveal pop={false}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
              Course RAG
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentTopicName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Groq Llama-3.3 70B</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="h-8 text-xs gap-1.5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Clear Chat</span>
            </Button>

            {/* Hide / Unhide Right Rail Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={`h-8 text-xs gap-1.5 border transition-all ${
                rightPanelOpen
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
              title={rightPanelOpen ? "Hide Knowledge Rail" : "Show Knowledge Rail"}
            >
              {rightPanelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRight className="h-3.5 w-3.5" />}
              <span>{rightPanelOpen ? "Hide Rail" : "Knowledge Rail"}</span>
              {sessions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900 font-mono">
                  {sessions.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Page Title & Context */}
      <ScrollReveal pop={false}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Chat Assistant
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Directly grounded in your course notes, slides, and Caliber {caliberScore} curriculum.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Horizontal Chat Sessions Bar (+ New Chat & Horizontal Tabs) */}
      <ScrollReveal delay={50} pop={false}>
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 overflow-x-auto scrollbar-none">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs shrink-0 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 shrink-0"></div>

          {/* Horizontal Saved Session Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
            {sessions.length > 0 ? (
              sessions.map((s) => {
                const isActive = s.session_id === sessionId;
                return (
                  <div
                    key={s.session_id}
                    onClick={() => selectSession(s.session_id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer group border ${
                      isActive
                        ? "bg-white dark:bg-slate-900 text-indigo-950 dark:text-white border-indigo-300 dark:border-indigo-700 shadow-xs"
                        : "bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <MessageSquare className={`h-3 w-3 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    <span className="max-w-[140px] truncate">{s.title || "Chat Session"}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({s.message_count})</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, s.session_id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-0.5 rounded transition-opacity"
                      title="Delete chat"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-slate-400 px-2">No past sessions saved. Start typing below!</span>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Main Spacious Canvas Grid (8 Cols Wide Chat + 4 Cols Right Rail or Full 12 Cols when collapsed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {/* Primary Wide Chat Section */}
        <section className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_16px_rgba(15,23,42,0.02)] transition-all flex-1 min-h-[660px] overflow-hidden ${
          rightPanelOpen ? "lg:col-span-8" : "lg:col-span-12"
        }`}>
          {/* Persona / Learning Modes Switcher Strip */}
          <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">Persona:</span>
              {LEARNING_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{mode.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline-block font-mono shrink-0">
              Caliber {caliberScore}
            </span>
          </div>

          {/* Chat Stream (Airy, highly legible, spacious) */}
          <div 
            ref={scrollRef}
            className="flex-1 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto max-h-[520px] min-h-[420px] relative scrollbar-thin"
          >
            {loadingHistory && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>Retrieving conversation history...</span>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isSpeaking = currentlySpeakingId === msg.id;
              const isCopied = copiedMsgId === msg.id;

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end w-full animate-in fade-in slide-in-from-bottom-1">
                    <div className="max-w-2xl bg-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-xs shadow-xs text-sm sm:text-base leading-relaxed break-words font-normal">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              // Assistant Response (Matching HTML template)
              return (
                <div key={msg.id} className="flex items-start gap-3.5 max-w-3xl w-full animate-in fade-in slide-in-from-bottom-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <Brain className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col gap-3 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          Adapted Tutor
                        </span>
                        <span className="text-[11px] text-slate-400">{msg.timestamp || "Just now"}</span>
                        {msg.mode && (
                          <Badge variant="outline" className="text-[10px] capitalize font-medium py-0 px-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">
                            {msg.mode}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 hover:text-slate-700 dark:hover:text-white transition-colors"
                          title="Copy response"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            className={`p-1 transition-colors ${
                              isSpeaking ? "text-rose-600 animate-pulse" : "hover:text-slate-700 dark:hover:text-white"
                            }`}
                            title={isSpeaking ? "Stop speech" : "Read aloud (TTS)"}
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Markdown Body */}
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words text-slate-800 dark:text-slate-200">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            const lang = match ? match[1] : "";
                            const rawCode = String(children).replace(/\n$/, "");
                            
                            if (lang === "mermaid") {
                              return <MermaidViewer chart={rawCode} />;
                            }
                            
                            const isMultiLine = rawCode.includes("\n");
                            if (!isMultiLine && !match) {
                              return (
                                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[13px]" {...props}>
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs">
                                <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                                  <span className="uppercase font-sans font-semibold">{lang || "code snippet"}</span>
                                  <button
                                    type="button"
                                    onClick={() => navigator.clipboard?.writeText(rawCode)}
                                    className="hover:text-white transition-colors"
                                  >
                                    Copy
                                  </button>
                                </div>
                                <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Grounding Reference Badge */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>
                          Grounded in: <strong className="font-semibold text-slate-700 dark:text-slate-300">{msg.sources[0].filename}</strong> (p. {msg.sources[0].page})
                        </span>
                      </div>
                    )}

                    {/* Minimal Interactive Action Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Link href="/practice">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Target className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Practice Drill</span>
                        </button>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Loading Placeholder */}
            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 py-2 animate-in fade-in">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <span>Searching indexed course notes and synthesizing response...</span>
              </div>
            )}
          </div>

          {/* Sleek Docked Input Bar at Bottom (Matching Template) */}
          <div className="p-4 lg:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Active Voice Listening Banner */}
            {isListening && (
              <div className="mb-2 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-semibold">Listening to your voice... Speak your question now!</span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="text-xs font-bold underline hover:text-rose-950"
                >
                  Cancel
                </button>
              </div>
            )}

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/10 rounded-2xl p-3 transition-all flex flex-col gap-2"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                disabled={isLoading}
                placeholder="Ask a question or request a derivation from your notes..."
                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none px-2 py-1 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1 px-1">
                <div className="flex items-center gap-2">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={`p-1.5 rounded-xl transition-all ${
                        isListening
                          ? "bg-rose-500 text-white animate-pulse"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-700"
                      }`}
                      title="Voice speech-to-text input"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    Caliber {caliberScore} Depth
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[11px] text-slate-400">Press ↵ to send</span>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Streamlined Right Rail (Col 4) - Hideable / Unhideable */}
        {rightPanelOpen && (
          <aside className="lg:col-span-4 flex flex-col gap-5 animate-in fade-in slide-in-from-right-2">
            {/* Section 0: Chat Stats & Counts in Short */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Chat Session Stats
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] text-slate-400">Saved Chats</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {sessions.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] text-slate-400">Messages Exchanged</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {messages.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Referenced Sources (Clean & Minimal) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Referenced Sources</h2>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                  {activeSources.length > 0 ? `${activeSources.length} Active` : "Indexed"}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {activeSources.length > 0 ? (
                  activeSources.map((source, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between group border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600">
                            {source.filename}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Page {source.page} • Grounded
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            Lecture 04 - Transformers.pdf
                          </span>
                          <span className="text-[11px] text-slate-400">Page 12 • 84% relevance</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-secondary shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            CS224N_Attention_Notes.pdf
                          </span>
                          <span className="text-[11px] text-slate-400">Page 4 • Referenced</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section 2: Suggested Inquiries (Quiet & Helpful) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3.5">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Suggested Inquiries</h2>
              </div>

              <div className="flex flex-col gap-2">
                {activeModeConfig.starterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    className="text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all text-xs text-slate-700 dark:text-slate-300 leading-snug flex items-start gap-2.5 group border border-slate-100 dark:border-slate-800"
                  >
                    <Play className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5 fill-indigo-600/20" />
                    <span>{prompt}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setInput("Please draw a clear Mermaid flowchart diagram explaining the attention mechanism forward pass.");
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="text-left p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-900 dark:text-emerald-300 transition-all text-xs leading-snug flex items-start gap-2.5 group border border-emerald-200/60 dark:border-emerald-900 font-medium"
                >
                  <Network className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Generate Mermaid Architecture Diagram</span>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[55vh]">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
