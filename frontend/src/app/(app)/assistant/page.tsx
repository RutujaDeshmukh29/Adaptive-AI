"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, FileText, Loader2, Sparkles, Brain, 
  HelpCircle, Baby, GraduationCap, Code2, Briefcase, 
  ArrowRight, Lightbulb, Network, Mic, MicOff, Volume2, VolumeX,
  History, Plus, Trash2, PanelLeft, PanelLeftClose, Clock, MessageSquare
} from "lucide-react";
import { fetchApi } from "@/lib";
import { 
  ChatResponse, ChatSource, LearningMode, 
  ChatSessionSummary, ChatSessionsResponse, ChatHistoryResponse 
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { MermaidViewer } from "@/components/ui/mermaid-viewer";

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
    tagline: "Balanced & Personalized",
    description: "Dynamically calibrated to your mastery score, goal, and recent performance trend.",
    icon: Brain,
    color: "text-blue-600",
    bgLight: "bg-blue-50 text-blue-700",
    borderActive: "border-blue-500 bg-blue-50/50 text-blue-900 shadow-sm",
    starterPrompts: [
      "Explain how Python list comprehensions work.",
      "What is the difference between shallow and deep copy?",
      "Can you summarize what we covered in my uploaded notes?"
    ]
  },
  {
    id: "socratic",
    name: "Socratic Guide",
    shortLabel: "Socratic",
    tagline: "Discovery Through Questions",
    description: "Guides you with probing questions and gentle hints instead of handing out answers.",
    icon: HelpCircle,
    color: "text-purple-600",
    bgLight: "bg-purple-50 text-purple-700",
    borderActive: "border-purple-500 bg-purple-50/50 text-purple-900 shadow-sm",
    starterPrompts: [
      "Why does list[-1] throw an IndexError on an empty list?",
      "How should I decide between a while loop and a for loop?",
      "What happens to local variables when a function returns?"
    ]
  },
  {
    id: "eli5",
    name: "ELI5 (Like I'm 5)",
    shortLabel: "ELI5",
    tagline: "Ultra-Simple Everyday Metaphors",
    description: "Uses playful real-world analogies with zero unexplained technical jargon.",
    icon: Baby,
    color: "text-amber-600",
    bgLight: "bg-amber-50 text-amber-700",
    borderActive: "border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm",
    starterPrompts: [
      "Explain recursion like I'm 5 years old.",
      "What is an API using a restaurant metaphor?",
      "How do pointers or memory references work in simple terms?"
    ]
  },
  {
    id: "exam",
    name: "Exam & Viva Prep",
    shortLabel: "Exam Prep",
    tagline: "High-Yield Syllabus Focus",
    description: "Delivers formal definitions, mark-scoring bullet points, and likely viva/exam questions.",
    icon: GraduationCap,
    color: "text-emerald-600",
    bgLight: "bg-emerald-50 text-emerald-700",
    borderActive: "border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm",
    starterPrompts: [
      "What are the 4 key differences between tuples and lists for exams?",
      "Give me a 5-mark answer definition of Python decorators.",
      "What tricky viva questions can examiners ask about generators?"
    ]
  },
  {
    id: "code",
    name: "Code-First",
    shortLabel: "Code-First",
    tagline: "Runnable Code & Edge Cases",
    description: "Leads with clean, working code snippets and sample console outputs before theory.",
    icon: Code2,
    color: "text-cyan-600",
    bgLight: "bg-cyan-50 text-cyan-700",
    borderActive: "border-cyan-500 bg-cyan-50/50 text-cyan-900 shadow-sm",
    starterPrompts: [
      "Show me a working custom generator function with comments.",
      "Demonstrate try-except-finally with an edge-case example.",
      "Write a one-liner to invert a dictionary in Python."
    ]
  },
  {
    id: "interview",
    name: "Technical Interview",
    shortLabel: "Interview",
    tagline: "Big-O & Industry Traps",
    description: "Focuses on time/space complexity, scalability trade-offs, and FAANG interview traps.",
    icon: Briefcase,
    color: "text-rose-600",
    bgLight: "bg-rose-50 text-rose-700",
    borderActive: "border-rose-500 bg-rose-50/50 text-rose-900 shadow-sm",
    starterPrompts: [
      "How do Python dictionaries achieve O(1) average lookup?",
      "Compare time/space complexity of DFS vs BFS.",
      "What is Python's GIL and how does it affect multithreading?"
    ]
  }
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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

export default function AssistantPage() {
  const [selectedMode, setSelectedMode] = useState<LearningMode>("adaptive");
  const [sessionId, setSessionId] = useState<string>(() => `sess_${Date.now()}`);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I'm your adaptive AI tutor. Select any of the **6 Learning Modes** above to switch my teaching persona, click the **microphone** to ask by voice, or ask for a **Mermaid diagram** of any topic!",
      mode: "adaptive"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeModeConfig = LEARNING_MODES.find(m => m.id === selectedMode) || LEARNING_MODES[0];

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
        setMessages(res.messages.map(m => ({
          id: m.id.toString(),
          role: m.role,
          content: m.content,
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
        id: "init",
        role: "assistant",
        content: "Hello! I'm your adaptive AI tutor. Select any of the **6 Learning Modes** above to switch my teaching persona, click the **microphone** to ask by voice, or ask for a **Mermaid diagram** of any topic!",
        mode: selectedMode
      }
    ]);
  };

  const handleDeleteSession = async (e: React.MouseEvent, targetSessionId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat session?")) return;
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

  // Initialize Speech Recognition & TTS cleanup
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

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

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
      alert("Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Stop speech error:", e);
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (msgId: string, content: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech audio is not supported in this browser.");
      return;
    }

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
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: textToSend,
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
          content: `Error: ${err.detail || "I couldn't connect to the server."}`,
          mode: selectedMode 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Adaptive Tutor
              <Badge variant="outline" className="text-xs font-normal bg-primary/5 text-primary border-primary/20">
                Voice + Diagrams + RAG
              </Badge>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Grounded in your uploaded course materials with 6 distinct pedagogical personas and voice assistant.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(prev => !prev)}
              className="text-xs gap-1.5 h-8 border-slate-200 text-slate-700 hover:bg-slate-100"
              title={sidebarOpen ? "Hide session history" : "Show session history"}
            >
              {sidebarOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
              <span>{sidebarOpen ? "Hide History" : "History"}</span>
              {sessions.length > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 bg-slate-100 font-mono">
                  {sessions.length}
                </Badge>
              )}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleNewChat}
              className="text-xs gap-1.5 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </Button>
          </div>
        </div>

        {/* 6 Learning Modes Bar */}
        <div className="mt-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
            {LEARNING_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    isActive 
                      ? mode.borderActive
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? mode.color : "text-slate-400"}`} />
                  <span>{mode.shortLabel}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Mode Banner */}
          <div className="mt-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-150 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <span className={`font-semibold ${activeModeConfig.color} flex items-center gap-1`}>
                <activeModeConfig.icon className="h-3.5 w-3.5" />
                {activeModeConfig.name}:
              </span>
              <span className="truncate">{activeModeConfig.description}</span>
            </div>
            <span className="hidden md:inline-block text-[11px] text-slate-400 font-mono">
              Mode: {activeModeConfig.id}
            </span>
          </div>
        </div>
      </div>
      
      {/* Chat Container with Sidebar */}
      <Card className="flex flex-1 overflow-hidden shadow-sm border-slate-200 relative">
        {/* Session History Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 sm:w-72 border-r border-slate-200 bg-slate-50/75 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <History className="h-3.5 w-3.5 text-primary" />
                <span>Conversations</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleNewChat}
                className="h-6 px-1.5 text-[11px] gap-1 hover:bg-white text-slate-600"
              >
                <Plus className="h-3 w-3 text-primary" />
                <span>New</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
              {loadingSessions ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Loading history...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  <MessageSquare className="h-6 w-6 mx-auto mb-1.5 opacity-30 text-slate-400" />
                  <span>No saved chats yet. Send a message to start!</span>
                </div>
              ) : (
                sessions.map((s) => {
                  const isActive = s.session_id === sessionId;
                  return (
                    <div
                      key={s.session_id}
                      onClick={() => selectSession(s.session_id)}
                      className={`group relative p-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                        isActive
                          ? "bg-white border-primary/40 shadow-xs text-slate-900 font-medium"
                          : "border-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="line-clamp-2 leading-snug break-words pr-2">
                          {s.title || "Conversation"}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, s.session_id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 rounded transition-opacity shrink-0"
                          title="Delete session"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {s.last_active}
                        </span>
                        <span className="bg-slate-100 group-hover:bg-white px-1.5 py-0.2 rounded border border-slate-200/50 font-mono">
                          {s.message_count} msgs
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0 bg-white">
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-5 relative"
          >
            {loadingHistory && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading conversation...</span>
                </div>
              </div>
            )}
          {messages.map((msg) => {
            const messageMode = LEARNING_MODES.find(m => m.id === msg.mode) || activeModeConfig;
            const ModeIcon = messageMode.icon;
            const isSpeaking = currentlySpeakingId === msg.id;

            return (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1 border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </Avatar>
                )}
                
                <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-xl p-4 text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-slate-50 text-slate-900 border border-slate-100 shadow-sm"
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
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
                                <code className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-800 font-mono text-[12px]" {...props}>
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <div className="my-2.5 rounded-lg overflow-hidden border border-slate-700/50 shadow-xs">
                                <div className="px-3 py-1 bg-slate-800 text-[11px] text-slate-300 font-mono flex items-center justify-between">
                                  <span>{lang || "code"}</span>
                                </div>
                                <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
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
                  </div>
                  
                  {msg.role === "assistant" && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {/* Active Mode Tag */}
                      <Badge variant="outline" className={`text-[11px] font-normal border ${messageMode.bgLight} border-current/20 flex items-center gap-1`}>
                        <ModeIcon className="h-3 w-3" />
                        {messageMode.name}
                      </Badge>

                      {/* Learner Context Adaptation */}
                      {msg.learnerContext && (
                        <Badge variant="outline" className="text-[11px] font-normal bg-slate-50 text-slate-500 border-slate-200">
                          Target: {msg.learnerContext.level} | Mastery: {msg.learnerContext.mastery ?? 0}%
                        </Badge>
                      )}
                      
                      {/* Grounded Source Citations */}
                      {msg.sources && msg.sources.length > 0 && msg.sources.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px] flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FileText className="h-3 w-3" />
                          {s.filename} (p. {s.page})
                        </Badge>
                      ))}

                      {/* Voice TTS Listen/Stop button */}
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors border ${
                          isSpeaking 
                            ? "bg-rose-50 text-rose-700 border-rose-200 font-medium animate-pulse"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={isSpeaking ? "Stop reading aloud" : "Read explanation aloud (TTS)"}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="h-3 w-3 text-rose-600" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 text-slate-500" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 mt-1 border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </Avatar>
              <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 text-slate-700 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900">{activeModeConfig.name}:</span>
                  <span className="text-slate-500 ml-1.5">Checking your local knowledge base & adapting response...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Bar & Mode Prompts */}
        <div className="p-3 bg-white border-t border-slate-100">
          {/* Active Voice Listening Banner */}
          {isListening && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-medium">Listening to your voice... Speak your question clearly!</span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-xs font-semibold text-rose-800 underline hover:text-rose-950"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Starter Prompt Pills for Active Mode */}
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              Try asking:
            </span>
            <button
              type="button"
              onClick={() => handleSend("Please draw a clear Mermaid flowchart diagram explaining the lifecycle and decision points of loops in Python.")}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-medium"
            >
              <Network className="h-3 w-3 text-emerald-600" />
              <span>Draw Concept Flowchart</span>
            </button>
            {activeModeConfig.starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
              >
                <span>{prompt}</span>
                <ArrowRight className="h-2.5 w-2.5 text-slate-400" />
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            {speechSupported && (
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleListening}
                disabled={isLoading}
                className={`shrink-0 transition-all ${
                  isListening 
                    ? "animate-pulse ring-2 ring-rose-400 bg-rose-500 text-white" 
                    : "text-slate-600 hover:text-primary hover:border-primary/40"
                }`}
                title={isListening ? "Listening... click to stop" : "Voice question (Speech-to-Text)"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Input 
              placeholder={`Ask in ${activeModeConfig.name} mode (or click mic to speak)...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="gap-1.5">
              <Send className="h-4 w-4" /> 
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
        </div>
      </Card>
    </div>
  );
}
