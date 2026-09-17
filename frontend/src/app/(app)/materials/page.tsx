"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, File as FileIcon, Trash2, CheckCircle2, AlertCircle, Loader2, FileText, Sparkles } from "lucide-react";
import { fetchApi } from "@/lib";
import { Material } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showNotification("error", "Only PDF files are supported for vector embedding.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", "Python");

    setIsUploading(true);

    const tempId = Date.now();
    setMaterials((prev) => [
      ...prev,
      { id: tempId, filename: file.name, status: "processing", chunk_count: 0, uploaded_at: new Date().toISOString() },
    ]);

    try {
      await fetchApi("/api/materials/upload", {
        method: "POST",
        body: formData,
      });

      showNotification("success", `"${file.name}" uploaded and indexed into ChromaDB vectors successfully!`);
      await loadMaterials();
    } catch (err: any) {
      showNotification("error", err.detail || "Failed to process and vectorize PDF.");
      setMaterials((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    try {
      await fetchApi(`/api/materials/${id}`, { method: "DELETE" });
      showNotification("success", `Removed "${filename}" and its vector chunks.`);
      loadMaterials();
    } catch (err) {
      showNotification("error", "Failed to delete material.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Base</h1>
        <p className="mt-2 text-slate-500">
          Upload your syllabus, lecture notes, or textbook PDFs. AdaptEd AI indexes them using SentenceTransformers and
          grounds the tutor and quizzes in your actual coursework.
        </p>
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
        <Card className="md:col-span-1 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>PDF format only (Max 20MB)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-slate-200 bg-slate-50 mx-6 mb-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">Click to browse or drop PDF</p>
                <p className="text-xs text-slate-500">Lecture slides, textbooks, code sheets</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-4 font-semibold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vectorizing PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Select PDF File
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Grounding Documents</CardTitle>
              <CardDescription>Currently indexing {totalChunks} knowledge chunks in ChromaDB</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            ) : materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <FileText className="h-12 w-12 text-slate-300 mb-4" />
                <p className="font-medium text-slate-700">No documents uploaded yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Upload your first PDF to enable cited AI answers and grounded quiz questions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((mat) => (
                  <div key={mat.id} className="flex items-center justify-between rounded-lg border p-4 bg-white">
                    <div className="flex items-center space-x-4 truncate">
                      <div className="rounded-full bg-slate-100 p-2.5 text-slate-600 shrink-0">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-semibold text-sm text-slate-900 truncate">{mat.filename}</h4>
                        <div className="flex items-center mt-1 space-x-2 text-xs text-slate-500">
                          {mat.status === "ready" && (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              <span>Vectorized ({mat.chunk_count} chunks indexed)</span>
                            </>
                          )}
                          {mat.status === "processing" && (
                            <>
                              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                              <span className="text-primary font-medium">Extracting text & generating embeddings...</span>
                            </>
                          )}
                          {mat.status === "failed" && (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                              <span className="text-red-500 font-medium">Failed to process PDF</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(mat.id, mat.filename)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
