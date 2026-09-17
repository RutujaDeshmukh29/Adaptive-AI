"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Loader2, Sparkles, Code2, Copy, Check, ZoomIn, ZoomOut, 
  RotateCcw, Maximize2, Minimize2, Download, Network, 
  BrainCircuit, ArrowLeftRight, Boxes, GitFork, RefreshCw,
  Eye, FileCode, Layers, Info
} from "lucide-react";
import { MermaidViewer } from "@/components/ui/mermaid-viewer";
import { fetchApi } from "@/lib";

type DiagramType = "flowchart" | "mindmap" | "sequenceDiagram" | "classDiagram" | "stateDiagram-v2" | "erDiagram";

interface DiagramTypeOption {
  type: DiagramType;
  label: string;
  badge: string;
  icon: any;
  description: string;
}

const DIAGRAM_TYPES: DiagramTypeOption[] = [
  { type: "flowchart", label: "Flowchart", badge: "Logic & Pipelines", icon: GitFork, description: "Process flow, algorithmic logic, decision trees" },
  { type: "mindmap", label: "Mindmap", badge: "Brainstorming", icon: BrainCircuit, description: "Taxonomies, concept trees, hierarchical breakdowns" },
  { type: "sequenceDiagram", label: "Sequence", badge: "APIs & Auth", icon: ArrowLeftRight, description: "System interactions, auth handshakes, microservices" },
  { type: "classDiagram", label: "Class Diagram", badge: "OOP & Schema", icon: Boxes, description: "Object schemas, classes, inheritance, interfaces" },
  { type: "stateDiagram-v2", label: "State Machine", badge: "Lifecycle", icon: Layers, description: "Finite state machines, UI states, lifecycle events" },
  { type: "erDiagram", label: "ER Diagram", badge: "Relational DB", icon: Network, description: "Database entities, tables, foreign key relationships" }
];

const STARTER_PRESETS: Record<DiagramType, { title: string; prompt: string }[]> = {
  flowchart: [
    { title: "OAuth 2.0 PKCE Flow", prompt: "OAuth 2.0 Authorization Code flow with PKCE between Client SPA, Auth Server, and Resource API" },
    { title: "RAG Retrieval Pipeline", prompt: "End-to-end RAG pipeline showing Document Ingestion, Chunking, Vector Embeddings, Hybrid Search, and LLM Generation" },
    { title: "CI/CD Kubernetes Deploy", prompt: "Git push to GitHub triggering GitHub Actions build, Docker containerization, security scan, and Kubernetes pod deployment" },
    { title: "Stripe Payment Lifecycle", prompt: "Customer checkout session, Stripe payment intent creation, webhook event verification, and order fulfillment" }
  ],
  mindmap: [
    { title: "Full-Stack Web Architect", prompt: "Mindmap of modern Full-Stack Web Development covering Frontend, Backend, Databases, DevOps, and System Design" },
    { title: "Machine Learning Taxonomy", prompt: "Mindmap classifying Artificial Intelligence into Supervised, Unsupervised, Reinforcement Learning, and Generative AI" },
    { title: "Cybersecurity Fundamentals", prompt: "Mindmap of Cybersecurity pillars: Network Security, Cryptography, Application Security, IAM, and Incident Response" },
    { title: "Cloud Native Computing", prompt: "Mindmap of Cloud Native ecosystem: Containers, Orchestration, Service Mesh, Observability, and Serverless" }
  ],
  sequenceDiagram: [
    { title: "JWT Auth & Refresh Token", prompt: "Sequence diagram of User login with access and refresh tokens, token expiration, and silent background refresh handshake" },
    { title: "Order Placement Saga", prompt: "Microservices distributed saga for E-Commerce Order Placement across API Gateway, Order Service, Payment Service, and Inventory" },
    { title: "WebSocket Live Sync", prompt: "Real-time client WebSocket connection handshake, bidirectional event streaming, ping-pong heartbeat, and disconnect reconnect" },
    { title: "DNS & TLS 1.3 Handshake", prompt: "Browser DNS query resolution followed by TCP 3-way handshake and TLS 1.3 cryptographic key exchange" }
  ],
  classDiagram: [
    { title: "E-Commerce Core Models", prompt: "UML Class diagram for E-Commerce system with User, Customer, Order, OrderItem, Product, and Payment entities with methods" },
    { title: "Social Network Graph", prompt: "Class diagram of a social media app modeling User, Profile, Post, Comment, Like, and Follow relationships" },
    { title: "Learning Management System", prompt: "Class diagram of LMS with Course, Module, Lesson, Quiz, Student, Instructor, and Certificate entities" },
    { title: "FinTech Digital Wallet", prompt: "Class diagram for digital wallet modeling Account, Wallet, Transaction, Currency, Card, and AuditLog" }
  ],
  "stateDiagram-v2": [
    { title: "Order Lifecycle", prompt: "State diagram of an e-commerce order: Pending, PaymentProcessing, Confirmed, InWarehouse, Shipped, Delivered, Cancelled, Refunded" },
    { title: "AI Model Training States", prompt: "State machine of an ML model run: Queued, Initializing, EpochRunning, Validating, Checkpointed, Converged, Failed" },
    { title: "Audio Player State Machine", prompt: "Audio media player lifecycle: Idle, Loading, Playing, Paused, Buffering, Seeking, Ended, Error" },
    { title: "Kanban Task Pipeline", prompt: "Software engineering task states: Backlog, ReadyForDev, InProgress, CodeReview, QAValidation, Done, Blocked" }
  ],
  erDiagram: [
    { title: "University Portal DB", prompt: "ER diagram for university system with STUDENT, PROFESSOR, COURSE, ENROLLMENT, DEPARTMENT, and CLASSROOM tables" },
    { title: "Healthcare Patient System", prompt: "ER diagram for hospital with PATIENT, DOCTOR, APPOINTMENT, MEDICAL_RECORD, PRESCRIPTION, and BILLING" },
    { title: "SaaS Subscription Model", prompt: "ER diagram for SaaS billing with ORGANIZATION, USER, SUBSCRIPTION_PLAN, INVOICE, PAYMENT_METHOD, and USAGE_METRIC" },
    { title: "Ride Sharing Database", prompt: "ER diagram for ride hailing app with PASSENGER, DRIVER, VEHICLE, RIDE, LOCATION_PING, and RATING" }
  ]
};

const SAMPLE_DEMO_DIAGRAM = `flowchart TD
    Client["Client Web / Mobile App"] -->|"1. HTTPS Request"| Gateway["API Gateway / Reverse Proxy"]
    Gateway -->|"2. JWT Verify & Rate Limit"| Auth["Auth Service (OAuth 2.0)"]
    Gateway -->|"3. Routed Query"| App["Core Application Server"]
    
    subgraph AI_Engine ["Adaptive AI Architecture"]
        App -->|"4. Concept Query"| VectorDB[("ChromaDB / Pinecone Vector Store")]
        VectorDB -->|"5. Top-K Semantic Embeddings"| LLM["Groq Llama-3.3 70B Engine"]
        LLM -->|"6. Synthesized Pedagogical Response"| App
    end
    
    App -->|"7. Persist Learner Mastery"| PrimaryDB[("PostgreSQL Dynamic Profile")]
    App -->|"8. Realtime Stream"| Client

    classDef primary fill:#4f46e5,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef secondary fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc;
    classDef storage fill:#1e293b,stroke:#a855f7,stroke-width:1.5px,color:#f8fafc;
    class Client,Gateway primary;
    class Auth,App,LLM secondary;
    class VectorDB,PrimaryDB storage;`;

export default function VisualizerPage() {
  const [prompt, setPrompt] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType>("flowchart");
  const [diagramCode, setDiagramCode] = useState<string>("");
  const [currentSvg, setCurrentSvg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"canvas" | "code">("canvas");
  const [editableCode, setEditableCode] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasBg, setCanvasBg] = useState<"grid" | "plain">("grid");

  // Pan and Zoom Canvas State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Handle SVG rendered callback stably
  const handleSvgRendered = useCallback((svg: string) => {
    setCurrentSvg(svg);
  }, []);

  // Sync editable code when diagramCode updates
  useEffect(() => {
    setEditableCode(diagramCode);
  }, [diagramCode]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleGenerate = async (overridePrompt?: string, overrideType?: DiagramType) => {
    const targetPrompt = (overridePrompt || prompt).trim();
    const targetType = overrideType || diagramType;
    if (!targetPrompt) return;
    
    setIsLoading(true);
    setError(null);
    setViewMode("canvas");
    
    try {
      const response = await fetchApi<{ mermaid_code: string }>("/api/diagram/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: targetPrompt,
          diagram_type: targetType
        })
      });
      
      setDiagramCode(response.mermaid_code);
      // Reset pan and zoom on new diagram
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    } catch (err: any) {
      setError(err.detail || "Failed to generate diagram. Please try again or simplify the prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setDiagramType("flowchart");
    setPrompt("Adaptive AI End-to-End RAG Architecture and PostgreSQL Mastery Pipeline");
    setDiagramCode(SAMPLE_DEMO_DIAGRAM);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setViewMode("canvas");
  };

  const handleCopyCode = () => {
    if (diagramCode) {
      navigator.clipboard.writeText(diagramCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyCodeEdit = () => {
    setDiagramCode(editableCode);
    setViewMode("canvas");
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3.0, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, +(z - 0.15).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== "canvas") return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(3.0, Math.max(0.3, +(prev + delta).toFixed(2))));
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== "canvas" || e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);

  // SVG Export
  const handleDownloadSvg = () => {
    if (!currentSvg) return;
    const blob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `adapted-ai-${diagramType}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // High-Resolution PNG / JPG Export (Zero-Canvas Server-Side Rasterization)
  const handleDownloadImage = async (format: "png" | "jpg" = "png") => {
    if (!currentSvg) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

      // Use the high-fidelity server-side rasterization endpoint (100% immune to tainted canvas SecurityError)
      const res = await fetch(`${apiUrl}/api/diagram/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          svg: currentSvg,
          format: format,
          is_dark: isDark
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `adapted-ai-${diagramType}-${Date.now()}.${format === "jpg" ? "jpg" : "png"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // If server returned non-200, download clean vector SVG
      handleDownloadSvg();
    } catch (err) {
      console.warn("Server rasterization unavailable, downloading vector SVG:", err);
      handleDownloadSvg();
    }
  };

  const handleDownloadPng = () => handleDownloadImage("png");
  const handleDownloadJpg = () => handleDownloadImage("jpg");

  const activeTypeMeta = DIAGRAM_TYPES.find((d) => d.type === diagramType) || DIAGRAM_TYPES[0];
  const activeStarters = STARTER_PRESETS[diagramType] || [];

  return (
    <div className="flex flex-col min-h-[calc(100vh-5.5rem)] space-y-4 pb-8">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Diagram Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              ✨ Vector Architecture Studio
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Synthesize, inspect, and export interactive flowcharts, mindmaps, and architecture diagrams with pan & zoom.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadDemo}
            className="h-8 text-xs gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Load Sample Flow</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout (Left Control Rail + Right Interactive Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar - Studio Controls (4 cols) */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-4">
          <Card className="shadow-lg border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4.5">
              {/* Diagram Type Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>1. Diagram Archetype</span>
                  <span className="text-[10px] font-normal text-indigo-600 dark:text-indigo-400 font-mono">
                    {activeTypeMeta.label}
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {DIAGRAM_TYPES.map((item) => {
                    const Icon = item.icon;
                    const isSelected = diagramType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setDiagramType(item.type)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30"
                            : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                          <span className="text-xs font-bold truncate">{item.label}</span>
                        </div>
                        <span className={`text-[10px] truncate ${isSelected ? "text-indigo-100" : "text-slate-400 dark:text-slate-400"}`}>
                          {item.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt Input Field */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>2. Design Prompt</span>
                  {prompt && (
                    <button
                      type="button"
                      onClick={() => setPrompt("")}
                      className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </label>

                <textarea
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                  rows={4}
                  placeholder={`Describe your ${activeTypeMeta.label.toLowerCase()} requirements or choose a preset below...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Quick Inspiration Chips */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Quick Starters ({activeTypeMeta.label})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(starter.prompt);
                        handleGenerate(starter.prompt, diagramType);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer text-left"
                    >
                      ⚡ {starter.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Action Button */}
              <Button 
                className="w-full h-10 gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all cursor-pointer" 
                onClick={() => handleGenerate()} 
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Architecture...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Diagram</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Studio Navigation & Gesture Pro Tips */}
          <Card className="shadow-sm border-slate-200/80 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Interactive Studio Controls</span>
              </h3>
              <ul className="text-xs text-indigo-800/80 dark:text-indigo-300/80 space-y-1.5 list-disc list-inside">
                <li><strong className="font-semibold">Pan:</strong> Click and drag anywhere on the canvas.</li>
                <li><strong className="font-semibold">Zoom:</strong> Scroll with mouse wheel or use <code className="px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 font-mono text-[10px]">+</code> / <code className="px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 font-mono text-[10px]">-</code>.</li>
                <li><strong className="font-semibold">Export:</strong> Download as crisp vector SVG or 2x Hi-DPI PNG.</li>
                <li><strong className="font-semibold">Edit:</strong> Toggle "View Code" to tweak Mermaid syntax directly.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Main Area - Interactive Canvas Studio (8 cols) */}
        <div className={`lg:col-span-8 xl:col-span-8 flex flex-col ${
          isFullscreen ? "fixed inset-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-2xl" : ""
        }`}>
          <Card className={`flex flex-col min-w-0 shadow-xl border-slate-200/80 dark:border-slate-800 overflow-hidden relative transition-all rounded-2xl ${
            isFullscreen ? "h-full w-full" : "min-h-[580px] lg:min-h-[660px] h-[calc(100vh-12rem)]"
          } bg-white dark:bg-slate-900`}>
            {/* Canvas Toolbar Strip */}
            <div className="h-12 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 bg-slate-50/80 dark:bg-slate-950/80 shrink-0 z-10">
              {/* Left Canvas Status */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${diagramCode ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  <span className="hidden sm:inline">
                    {diagramCode ? `${activeTypeMeta.label} • Live Canvas` : "Canvas Empty"}
                  </span>
                </div>

                {diagramCode && (
                  <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode("canvas")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        viewMode === "canvas"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>Canvas</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("code")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        viewMode === "code"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <FileCode className="h-3 w-3" />
                        <span>Code</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Toolbar Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {viewMode === "canvas" && (
                  <>
                    {/* Zoom Controls */}
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Zoom Out (-)"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                        title="Click to reset zoom to 100%"
                      >
                        {Math.round(zoom * 100)}%
                      </button>

                      <button
                        type="button"
                        onClick={handleZoomIn}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Zoom In (+)"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="p-1 border-l border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Reset Pan & Zoom"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    {/* Canvas Grid Background Toggle */}
                    <button
                      type="button"
                      onClick={() => setCanvasBg(canvasBg === "grid" ? "plain" : "grid")}
                      className={`p-1.5 rounded-lg border text-xs transition-colors hidden sm:block ${
                        canvasBg === "grid"
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700"
                      }`}
                      title={canvasBg === "grid" ? "Disable Grid Dots" : "Enable Blueprint Grid"}
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}

                {/* Export Dropdown / Buttons */}
                {diagramCode && (
                  <>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                    {/* Download SVG */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadSvg}
                      className="h-7 px-2 text-[11px] gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                      title="Download clean vector SVG file"
                    >
                      <Download className="h-3 w-3" />
                      <span className="hidden xs:inline">SVG</span>
                    </Button>

                    {/* Download PNG */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPng}
                      className="h-7 px-2 text-[11px] gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                      title="Download high-resolution 2x Retina PNG image"
                    >
                      <Download className="h-3 w-3" />
                      <span className="hidden xs:inline">PNG</span>
                    </Button>

                    {/* Download JPG */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadJpg}
                      className="h-7 px-2 text-[11px] gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                      title="Download high-quality JPG image"
                    >
                      <Download className="h-3 w-3" />
                      <span className="hidden xs:inline">JPG</span>
                    </Button>

                    {/* Copy Mermaid Code */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-7 px-2 text-[11px] gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                      title="Copy Mermaid source code"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                    </Button>
                  </>
                )}

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Interactive Canvas Viewport */}
            <div 
              ref={canvasContainerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`flex-1 overflow-hidden relative flex items-center justify-center select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              } ${
                canvasBg === "grid"
                  ? "bg-slate-50/60 dark:bg-slate-950/80 [background-image:radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:[background-image:radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:24px_24px]"
                  : "bg-slate-50/40 dark:bg-slate-950/60"
              }`}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3 z-10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 shadow-md animate-pulse">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Synthesizing {activeTypeMeta.label}...</p>
                    <p className="text-xs text-slate-500">Generating Mermaid graph syntax tree and vector nodes</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 text-center max-w-md mx-auto z-10">
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                    <p className="font-bold mb-1">Rendering Error</p>
                    <p>{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerate()}
                      className="mt-3 text-xs gap-1 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Retry Generation</span>
                    </Button>
                  </div>
                </div>
              ) : diagramCode ? (
                viewMode === "code" ? (
                  /* Syntax Editor View */
                  <div className="absolute inset-0 p-4 bg-slate-950 text-slate-100 flex flex-col z-20">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                      <span className="text-xs font-mono text-slate-400">Mermaid.js Source Definition</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleApplyCodeEdit}
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Apply & Render Canvas</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyCode}
                          className="h-7 text-xs text-slate-400 hover:text-white"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={editableCode}
                      onChange={(e) => setEditableCode(e.target.value)}
                      className="w-full flex-1 bg-transparent font-mono text-xs leading-relaxed text-slate-100 resize-none focus:outline-none p-2 border border-slate-800 rounded-lg"
                      spellCheck={false}
                    />
                  </div>
                ) : (
                  /* Scalable & Pannable Vector Canvas */
                  <div
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: "center center",
                      transition: isDragging ? "none" : "transform 0.12s ease-out"
                    }}
                    className="p-8 inline-flex items-center justify-center min-w-fit pointer-events-auto"
                  >
                    <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-slate-200/80 dark:border-slate-800 min-w-[320px] max-w-full flex items-center justify-center">
                      <MermaidViewer 
                        chart={diagramCode} 
                        onSvgRendered={handleSvgRendered}
                      />
                    </div>
                  </div>
                )
              ) : (
                /* Empty Canvas State */
                <div className="flex flex-col items-center justify-center text-center p-6 max-w-md gap-4 z-10">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10 animate-bounce duration-1000">
                    <Network className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Infinite Architecture Canvas
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Select an archetype from the sidebar, click any starter template, or type your own custom specifications to synthesize live vector visual structures.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleLoadDemo}
                      className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Load Sample Architecture</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status / Zoom Indicator */}
            {diagramCode && viewMode === "canvas" && (
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-2 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Pan: ({Math.round(pan.x)}, {Math.round(pan.y)})</span>
                <span>•</span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
