"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Upload, File as FileIcon, Trash2, CheckCircle2, 
  AlertCircle, Loader2, FileText, Sparkles, ShieldCheck, 
  Layers, FolderPlus 
} from "lucide-react";
import { fetchApi } from "@/lib";
import { Material } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFiles.length === 0) {
      showNotification("error", "Only PDF documents (.pdf) are supported for vector embedding.");
      return;
    }

    if (pdfFiles.length < files.length) {
      showNotification("error", "Some non-PDF files were skipped. Only PDF files were selected.");
    }

    setIsUploading(true);
    setUploadProgressText(`Uploading & vectorizing ${pdfFiles.length} file${pdfFiles.length > 1 ? "s" : ""} in ChromaDB...`);

    // Add optimistic temporary items
    const tempItems = pdfFiles.map((file, idx) => ({
      id: Date.now() + idx,
      filename: file.name,
      status: "processing" as const,
      chunk_count: 0,
      uploaded_at: new Date().toISOString()
    }));

    setMaterials(prev => [...tempItems, ...prev]);

    const formData = new FormData();
    pdfFiles.forEach(file => {
      formData.append("files", file);
    });
    formData.append("subject", "Python");

    try {
      const results = await fetchApi<Material[]>("/api/materials/upload-batch", {
        method: "POST",
        body: formData,
      });

      const totalNewChunks = results.reduce((acc, curr) => acc + (curr.chunk_count || 0), 0);
      showNotification(
        "success", 
        `Successfully vectorized ${results.length} PDF${results.length > 1 ? "s" : ""} (${totalNewChunks} new chunks indexed in local ChromaDB)!`
      );
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
      processFiles(Array.from(e.target.files));
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
      processFiles(Array.from(e.dataTransfer.files));
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              Knowledge Base
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-normal">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Local ChromaDB (Secure)
              </Badge>
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Upload your syllabus, lecture notes, or textbooks. Materials are processed into local semantic vector chunks 
              so only precise snippets are referenced during tutoring, protecting your private data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{materials.length} Documents</span>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-slate-900">{totalChunks} Chunks</span>
            </Badge>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border text-sm transition-all animate-fade-in ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Multi-PDF Drag and Drop Upload Card */}
        <Card className="md:col-span-1 border-slate-200 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Upload Multiple PDFs</CardTitle>
            <CardDescription>Select or drop multiple course notes at once</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300"
              }`}
            >
              <div className="rounded-full bg-primary/10 p-4 text-primary mb-3">
                <Upload className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold text-slate-900 text-center">
                {isDragging ? "Drop your PDFs here" : "Drag & drop multiple PDFs here"}
              </p>
              <p className="text-xs text-slate-500 text-center mt-1">
                or click to browse your files
              </p>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Batch PDF upload supported
              </p>
            </div>

            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-4 w-full font-semibold gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  <span className="truncate">{uploadProgressText || "Vectorizing..."}</span>
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4" /> Select PDF Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Grounding Documents List */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Grounding Materials</CardTitle>
              <CardDescription>
                Indexed in your private ChromaDB vector collection for instant RAG citations
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <FileText className="h-12 w-12 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-700">No documents uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Upload one or more PDF files to ground the AI tutor with inline page citations and course-specific quiz generation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((mat) => (
                  <div 
                    key={mat.id} 
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center space-x-3.5 truncate">
                      <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-semibold text-sm text-slate-900 truncate">{mat.filename}</h4>
                        <div className="flex items-center mt-1 space-x-2 text-xs text-slate-500">
                          {mat.status === "ready" && (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="font-medium text-emerald-700">Ready</span>
                              <span className="text-slate-300">•</span>
                              <span>{mat.chunk_count} semantic vector chunks</span>
                            </>
                          )}
                          {mat.status === "processing" && (
                            <>
                              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                              <span className="text-primary font-medium">Extracting text & indexing vectors...</span>
                            </>
                          )}
                          {mat.status === "failed" && (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                              <span className="text-rose-600 font-medium">Indexing failed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(mat.id, mat.filename)}
                        disabled={mat.status === "processing"}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 rounded-lg"
                        title="Delete material and ChromaDB vectors"
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
      </div>
    </div>
  );
}
