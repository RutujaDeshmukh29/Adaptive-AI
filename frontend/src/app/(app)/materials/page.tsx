"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Upload, File as FileIcon, Trash2, CheckCircle2, 
  AlertCircle, Loader2, FileText, Sparkles, ShieldCheck, 
  Layers, FolderPlus, BookOpen, Copy, Check, Printer, X,
  Zap, Baby, FileSpreadsheet, Search, Target, MessageSquare,
  RefreshCw, ChevronRight, Download, Info
} from "lucide-react";
import { fetchApi } from "@/lib";
import { Material } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type SummaryMode = "detailed" | "shortnotes" | "cheatsheet" | "eli5";

interface SummaryModeOption {
  id: SummaryMode;
  label: string;
  icon: React.ElementType;
  description: string;
  badgeColor: string;
}

const SUMMARY_MODES: SummaryModeOption[] = [
  {
    id: "detailed",
    label: "Comprehensive Summary",
    icon: BookOpen,
    description: "Detailed section-by-section breakdown with critical takeaways & common pitfalls",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
  },
  {
    id: "shortnotes",
    label: "Short Revision Notes",
    icon: FileSpreadsheet,
    description: "High-density bullet points, core definitions, and 5-minute pre-exam recap checklist",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
  },
  {
    id: "cheatsheet",
    label: "Cheat Sheet & Formulas",
    icon: Zap,
    description: "High-yield syntax tables, concise formulas, and rapid-recall definitions",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
  },
  {
    id: "eli5",
    label: "ELI5 Concept Story",
    icon: Baby,
    description: "Ultra-intuitive analogies and everyday real-world stories with zero technical jargon",
    badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
  }
];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectTag, setSubjectTag] = useState("General");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart Study Pack State
  const [summarizeMaterial, setSummarizeMaterial] = useState<Material | null>(null);
  const [activeSummaryMode, setActiveSummaryMode] = useState<SummaryMode>("detailed");
  const [summariesCache, setSummariesCache] = useState<Record<string, string>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 6000);
  };

  const loadMaterials = async () => {
    try {
      const data = await fetchApi<{ materials: Material[]; total_chunks: number }>("/api/materials");
      setMaterials(data.materials);
      setTotalChunks(data.total_chunks);
    } catch (err) {
      showNotification("error", "Failed to retrieve uploaded course materials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleQueueFiles = (files: File[]) => {
    const pdfs = files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) {
      showNotification("error", "Only PDF documents (.pdf) are supported for vector embedding.");
      return;
    }
    if (pdfs.length < files.length) {
      showNotification("error", "Some non-PDF files were skipped. Only PDF files are supported.");
    }
    setPendingFiles(prev => [...prev, ...pdfs]);
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processPendingUpload = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgressText(`Vectorizing ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""} in ChromaDB...`);

    const tempItems = pendingFiles.map((file, idx) => ({
      id: Date.now() + idx,
      filename: file.name,
      status: "processing" as const,
      chunk_count: 0,
      uploaded_at: new Date().toISOString()
    }));

    setMaterials(prev => [...tempItems, ...prev]);

    const formData = new FormData();
    pendingFiles.forEach(file => {
      formData.append("files", file);
    });
    formData.append("subject", subjectTag);

    try {
      const results = await fetchApi<Material[]>("/api/materials/upload-batch", {
        method: "POST",
        body: formData,
      });

      const totalNewChunks = results.reduce((acc, curr) => acc + (curr.chunk_count || 0), 0);
      showNotification(
        "success", 
        `Successfully indexed ${results.length} PDF${results.length > 1 ? "s" : ""} (${totalNewChunks} semantic chunks added to ChromaDB)!`
      );
      setPendingFiles([]);
      await loadMaterials();
    } catch (err: any) {
      showNotification("error", err.detail || "Failed to process and vectorize batch PDFs.");
      await loadMaterials();
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleQueueFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleQueueFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    try {
      await fetchApi(`/api/materials/${id}`, { method: "DELETE" });
      showNotification("success", `Removed "${filename}" and its vector chunks from ChromaDB.`);
      loadMaterials();
    } catch (err) {
      showNotification("error", "Failed to delete material.");
    }
  };

  // Study Pack Handlers
  const openSummarizer = (material: Material) => {
    setSummarizeMaterial(material);
    setActiveSummaryMode("detailed");
    triggerSummarize(material.id, "detailed");
  };

  const triggerSummarize = async (materialId: number, mode: SummaryMode) => {
    const cacheKey = `${materialId}_${mode}`;
    if (summariesCache[cacheKey]) {
      return;
    }

    setIsSummarizing(true);
    try {
      const res = await fetchApi<{ summary: string }>(`/api/materials/${materialId}/summarize`, {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      setSummariesCache(prev => ({ ...prev, [cacheKey]: res.summary }));
    } catch (err: any) {
      showNotification("error", err.detail || "Failed to generate AI study pack.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleModeChange = (mode: SummaryMode) => {
    setActiveSummaryMode(mode);
    if (summarizeMaterial) {
      triggerSummarize(summarizeMaterial.id, mode);
    }
  };

  const handleCopySummary = () => {
    if (!summarizeMaterial) return;
    const cacheKey = `${summarizeMaterial.id}_${activeSummaryMode}`;
    const text = summariesCache[cacheKey] || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSummary = summarizeMaterial 
    ? summariesCache[`${summarizeMaterial.id}_${activeSummaryMode}`] || ""
    : "";

  const filteredMaterials = materials.filter(m => 
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-5.5rem)] space-y-6 pb-12">
      {/* Top Header Strip */}
      <ScrollReveal pop={false}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Knowledge Base & Study Hub
              </h1>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 gap-1 font-semibold text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Local ChromaDB (Secure)
              </Badge>
              <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 gap-1 font-semibold text-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Smart Study Pack Generator
              </Badge>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Upload syllabus notes and textbooks. Materials are vectorized into local ChromaDB for grounding tutor answers, creating adaptive practice drills, and generating instant <strong>Summaries, Short Notes, and Cheat Sheets</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{materials.length} Documents</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{totalChunks} Chunks</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border text-xs sm:text-sm transition-all animate-in fade-in shadow-xs ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Grid: Left Upload Station (5 cols) + Right Materials Intelligence Hub (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Multi-PDF Upload Station */}
        <ScrollReveal delay={50} pop={false} className="lg:col-span-5 flex flex-col gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Upload Course Documents
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Select or drop multiple PDF files for semantic indexing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 flex flex-col gap-4">
              {/* Subject Tag Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Subject / Topic Domain
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["Artificial Intelligence", "Machine Learning", "Data Structures", "System Design", "Python", "General"].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubjectTag(sub)}
                      className={`px-2.5 py-1 text-xs rounded-xl border transition-all cursor-pointer font-medium ${
                        subjectTag === sub
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag & Drop Multi-File Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 hover:border-indigo-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="h-6 w-6" />
                </div>
                
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Drag & drop multiple PDFs here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  or click to browse your computer
                </p>
                <div className="mt-3 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  ⚡ Batch PDF upload supported
                </div>
              </div>

              {/* Pending Files Queue */}
              {pendingFiles.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Selected Files ({pendingFiles.length})</span>
                    <button
                      type="button"
                      onClick={() => setPendingFiles([])}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate font-medium text-slate-900 dark:text-white">{f.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({(f.size / (1024 * 1024)).toFixed(1)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemovePendingFile(i); }}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={processPendingUpload}
                    disabled={isUploading}
                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs h-9 shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{uploadProgressText || "Vectorizing..."}</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4" />
                        <span>Upload & Index {pendingFiles.length} Document{pendingFiles.length > 1 ? "s" : ""}</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Local Storage & Privacy Callout */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900/80 dark:text-indigo-300/80 space-y-1">
                  <p className="font-bold text-indigo-950 dark:text-indigo-200">Local Vector Privacy</p>
                  <p className="leading-relaxed">
                    PDF text is extracted, chunked, and embedded into your isolated ChromaDB collection. Your documents remain private and are only retrieved during your learning queries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Right Column: Grounding Materials List & Study Intelligence Hub */}
        <ScrollReveal delay={100} pop={false} className="lg:col-span-7 flex flex-col gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Indexed Knowledge Materials</span>
                    <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      {filteredMaterials.length} Active
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Source materials for inline citations, quizzes, and instant Study Packs
                  </CardDescription>
                </div>

                {/* Filter Search Input */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                  <p className="text-xs font-medium">Loading ChromaDB knowledge base...</p>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {searchQuery ? "No matching documents found" : "No Knowledge Base Documents Yet"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {searchQuery 
                      ? "Try searching for a different keyword or clear the search filter."
                      : "Upload your syllabus notes, lecture slides, or textbook PDFs on the left to start generating instant Study Packs."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {mat.filename}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
                            {mat.status === "ready" ? (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Ready</span>
                              </span>
                            ) : mat.status === "processing" ? (
                              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Vectorizing...</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Failed</span>
                              </span>
                            )}
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="font-mono text-slate-500 dark:text-slate-400">
                              {mat.chunk_count} vector chunks
                            </span>
                            {mat.uploaded_at && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span className="text-slate-400">
                                  {new Date(mat.uploaded_at).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Suite for Document */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        {mat.status === "ready" && (
                          <>
                            {/* Study Pack Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSummarizer(mat)}
                              className="h-8 text-xs gap-1.5 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold shadow-2xs cursor-pointer"
                              title="Generate Study Pack (Comprehensive, Short Notes, Cheat Sheet, ELI5)"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Study Pack</span>
                            </Button>

                            {/* Practice Drill */}
                            <Link href="/practice">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                title="Practice MCQs from syllabus"
                              >
                                <Target className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Quiz</span>
                              </Button>
                            </Link>
                          </>
                        )}

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(mat.id, mat.filename)}
                          disabled={mat.status === "processing"}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 h-8 w-8 rounded-lg cursor-pointer"
                          title="Delete material and ChromaDB vector chunks"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      {/* Smart Study Pack Viewer Modal / Drawer */}
      {summarizeMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            {/* Modal Header */}
            <CardHeader className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-600 text-white text-xs gap-1 font-semibold">
                      <Sparkles className="h-3 w-3" /> AI Study Intelligence
                    </Badge>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-mono">{summarizeMaterial.chunk_count} ChromaDB chunks</span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                    {summarizeMaterial.filename}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopySummary}
                    disabled={!currentSummary || isSummarizing}
                    className="h-8 text-xs gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSummarizeMaterial(null)}
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 4-Tab Study Pack Switcher */}
              <div className="flex flex-wrap gap-1.5 pt-3">
                {SUMMARY_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeSummaryMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleModeChange(mode.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-indigo-400"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            {/* Modal Content Body */}
            <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {isSummarizing ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Synthesizing {SUMMARY_MODES.find(m => m.id === activeSummaryMode)?.label}...
                  </p>
                  <p className="text-xs text-slate-500">
                    Extracting vector chunks from {summarizeMaterial.filename}
                  </p>
                </div>
              ) : currentSummary ? (
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table({ children }: any) {
                        return (
                          <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900/80">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children }: any) {
                        return (
                          <thead className="bg-slate-100/80 dark:bg-slate-800/90 text-slate-900 dark:text-white font-bold border-b border-slate-200/80 dark:border-slate-700">
                            {children}
                          </thead>
                        );
                      },
                      th({ children }: any) {
                        return (
                          <th className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100 text-xs tracking-wide">
                            {children}
                          </th>
                        );
                      },
                      td({ children }: any) {
                        return (
                          <td className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                            {children}
                          </td>
                        );
                      },
                      tr({ children }: any) {
                        return (
                          <tr className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors">
                            {children}
                          </tr>
                        );
                      }
                    }}
                  >
                    {currentSummary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <p className="text-sm font-medium">Select a mode above to generate study notes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
