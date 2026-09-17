"use client";

import { useState, useRef, useEffect } from "react";
import { Send, FileText, Loader2, Sparkles } from "lucide-react";
import { fetchApi } from "@/lib";
import { ChatResponse, ChatSource } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  learnerContext?: any;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I'm your adaptive AI tutor. Ask me anything about your subjects, and I'll tailor my explanation to your level and pull from the materials you uploaded."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await fetchApi<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage.content }),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        learnerContext: data.learner_context_used
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: `Error: ${err.detail || "I couldn't connect to the server."}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Adaptive Tutor</h1>
        <p className="mt-2 text-slate-500">Ask a question, and I'll answer using your uploaded PDFs, tailored to your mastery level.</p>
      </div>
      
      <Card className="flex flex-col flex-1 overflow-hidden shadow-sm border-slate-200">
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-6"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1 border border-primary/20 bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </Avatar>
              )}
              
              <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`rounded-xl p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-900"}`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                
                {msg.role === "assistant" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.learnerContext && (
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200">
                        Target: {msg.learnerContext.level} | Trend: {msg.learnerContext.adaptation}
                      </Badge>
                    )}
                    
                    {msg.sources && msg.sources.length > 0 && msg.sources.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {s.filename} (Pg {s.page})
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="h-8 w-8 mt-1 border border-primary/20 bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </Avatar>
              <div className="rounded-xl p-4 bg-slate-100 text-slate-900 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                <span className="text-sm text-slate-500">Thinking and checking your knowledge graph...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white border-t border-slate-100">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <Input 
              placeholder="Ask about Python variables, loops, or anything in your PDFs..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4 mr-2" /> Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
