"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, File as FileIcon, Trash2, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";
import { fetchApi } from "@/lib";
import { Material } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMaterials = async () => {
    try {
      const data = await fetchApi<{materials: Material[], total_chunks: number}>("/api/materials");
      setMaterials(data.materials);
      setTotalChunks(data.total_chunks);
    } catch (err) {
      alert("Failed to load materials");
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
      alert("Only PDF files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", "Python");

    setIsUploading(true);
    
    const tempId = Date.now();
    setMaterials(prev => [...prev, { id: tempId, filename: file.name, status: "processing", chunk_count: 0, uploaded_at: new Date().toISOString() }]);

    try {
      await fetchApi("/api/materials/upload", {
        method: "POST",
        body: formData,
      });
      
      alert("File uploaded and processed successfully.");
      await loadMaterials();
    } catch (err: any) {
      alert(err.detail || "Something went wrong");
      setMaterials(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetchApi(`/api/materials/${id}`, { method: "DELETE" });
      alert("Material removed successfully.");
      loadMaterials();
    } catch (err) {
      alert("Failed to delete material");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Base</h1>
        <p className="mt-2 text-slate-500">Upload your PDFs, class notes, and syllabus. AdaptEd AI will ground its answers in your actual course material.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upload Material</CardTitle>
            <CardDescription>PDF format only (Max 20MB)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-slate-200 bg-slate-50 mx-6 mb-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">Click to browse or drag and drop</p>
                <p className="text-xs text-slate-500">Your syllabus, notes, or assignment docs.</p>
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
                className="mt-4"
              >
                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Select PDF File"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Materials</CardTitle>
              <CardDescription>Currently indexing {totalChunks} knowledge chunks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
            ) : materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <FileText className="h-12 w-12 text-slate-300 mb-4" />
                <p>No materials uploaded yet.</p>
                <p className="text-sm">Answers will be generated from general knowledge.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((mat) => (
                  <div key={mat.id} className="flex items-center justify-between rounded-lg border p-4 bg-white">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-slate-900">{mat.filename}</h4>
                        <div className="flex items-center mt-1 space-x-2 text-xs text-slate-500">
                          {mat.status === "ready" && <><CheckCircle2 className="h-3 w-3 text-green-500" /> <span>Processed ({mat.chunk_count} chunks)</span></>}
                          {mat.status === "processing" && <><Loader2 className="h-3 w-3 text-primary animate-spin" /> <span>Extracting text & creating vectors...</span></>}
                          {mat.status === "failed" && <><AlertCircle className="h-3 w-3 text-red-500" /> <span className="text-red-500">Failed to process</span></>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(mat.id)} className="text-slate-400 hover:text-red-500">
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
