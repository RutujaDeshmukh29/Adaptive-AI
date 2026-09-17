"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Code2, Copy, Check } from "lucide-react";
import { MermaidViewer } from "@/components/ui/mermaid-viewer";
import { fetchApi } from "@/lib";

type DiagramType = "flowchart" | "mindmap" | "sequenceDiagram" | "classDiagram";

export default function VisualizerPage() {
  const [prompt, setPrompt] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType>("flowchart");
  const [diagramCode, setDiagramCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setShowCode(false);
    
    try {
      const response = await fetchApi<{mermaid_code: string}>("/api/diagram/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt.trim(),
          diagram_type: diagramType
        })
      });
      
      setDiagramCode(response.mermaid_code);
    } catch (err: any) {
      setError(err.detail || "Failed to generate diagram. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (diagramCode) {
      navigator.clipboard.writeText(diagramCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const starterPrompts = {
    flowchart: "How a Next.js application routes a request",
    mindmap: "Core concepts of Python programming",
    sequenceDiagram: "User login authentication flow",
    classDiagram: "E-commerce system with Users, Orders, and Products"
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Diagram Studio</h1>
        <p className="mt-2 text-slate-500">
          Transform text into beautiful Flowcharts, Mindmaps, and Architecture diagrams instantly.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 pb-4">
        {/* Left Sidebar - Controls */}
        <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Diagram Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["flowchart", "mindmap", "sequenceDiagram", "classDiagram"] as DiagramType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setDiagramType(type)}
                      className={`px-3 py-2 text-xs font-medium rounded-md border text-center transition-colors ${
                        diagramType === type
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {type === "flowchart" && "Flowchart"}
                      {type === "mindmap" && "Mindmap"}
                      {type === "sequenceDiagram" && "Sequence"}
                      {type === "classDiagram" && "Class"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">What do you want to draw?</label>
                <textarea
                  className="w-full p-3 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={4}
                  placeholder={`E.g., ${starterPrompts[diagramType]}`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <Button 
                className="w-full gap-2" 
                onClick={handleGenerate} 
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Diagram
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="shadow-sm border-slate-200 bg-amber-50/50">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-amber-800 mb-2">Pro Tips</h3>
              <ul className="text-[11px] text-amber-700 space-y-1.5 list-disc list-inside">
                <li>Be specific about the steps or relationships.</li>
                <li>Mindmaps are great for brainstorming structures.</li>
                <li>Sequence diagrams are perfect for API or network flows.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Main Area - Canvas */}
        <Card className="flex-1 flex flex-col min-w-0 min-h-0 shadow-sm border-slate-200 overflow-hidden relative bg-white">
          {/* Canvas Toolbar */}
          <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/50 shrink-0">
            <span className="text-xs font-medium text-slate-500">
              {diagramCode ? "Diagram Ready" : "Canvas Empty"}
            </span>
            
            {diagramCode && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[11px] gap-1.5"
                  onClick={() => setShowCode(!showCode)}
                >
                  <Code2 className="h-3 w-3" />
                  {showCode ? "View Graph" : "View Code"}
                </Button>
              </div>
            )}
          </div>

          {/* Render Area */}
          <div className="flex-1 overflow-auto p-6 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                <p className="text-sm font-medium">Drawing your {diagramType}...</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <p className="text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-lg border border-rose-100">{error}</p>
              </div>
            ) : diagramCode ? (
              showCode ? (
                <div className="relative h-full">
                  <button 
                    onClick={handleCopyCode}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg text-xs font-mono h-full overflow-auto">
                    {diagramCode}
                  </pre>
                </div>
              ) : (
                <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                  <MermaidViewer chart={diagramCode} />
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">Select a type and enter a prompt to generate a diagram</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
