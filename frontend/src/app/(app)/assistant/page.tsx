"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, FileText, Loader2, Sparkles, Brain, 
  HelpCircle, Baby, GraduationCap, Code2, Briefcase, 
  ArrowRight, Lightbulb 
} from "lucide-react";
import { fetchApi } from "@/lib";
import { ChatResponse, ChatSource, LearningMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

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

export default function AssistantPage() {
  const [selectedMode, setSelectedMode] = useState<LearningMode>("adaptive");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I'm your adaptive AI tutor. Select any of the **6 Learning Modes** above to switch my teaching persona, or ask anything about your uploaded syllabus.",
      mode: "adaptive"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeModeConfig = LEARNING_MODES.find(m => m.id === selectedMode) || LEARNING_MODES[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

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
          mode: selectedMode 
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
                RAG + Local ChromaDB
              </Badge>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Grounded in your uploaded course materials with 6 distinct pedagogical personas.
            </p>
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
      
      {/* Chat Container */}
      <Card className="flex flex-col flex-1 overflow-hidden shadow-sm border-slate-200">
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-5"
        >
          {messages.map((msg) => {
            const messageMode = LEARNING_MODES.find(m => m.id === msg.mode) || activeModeConfig;
            const ModeIcon = messageMode.icon;

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
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
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
          {/* Starter Prompt Pills for Active Mode */}
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              Try asking:
            </span>
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
            <Input 
              placeholder={`Ask in ${activeModeConfig.name} mode (grounded in your uploaded PDFs)...`}
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
      </Card>
    </div>
  );
}
