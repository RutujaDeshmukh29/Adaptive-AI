"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib";
import { PathResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Circle, Lock, PlayCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PathPage() {
  const [pathData, setPathData] = useState<PathResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi<PathResponse>("/api/path");
        setPathData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!pathData) {
    return <div>Failed to load path.</div>;
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'done': return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'current': return <PlayCircle className="h-6 w-6 text-primary" />;
      case 'in_progress': return <Circle className="h-6 w-6 text-yellow-500" />;
      default: return <Lock className="h-6 w-6 text-slate-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'done': return "border-green-500 bg-green-50";
      case 'current': return "border-primary bg-primary/5 ring-1 ring-primary";
      case 'in_progress': return "border-yellow-500 bg-yellow-50";
      default: return "border-slate-200 bg-slate-50 opacity-60";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Learning Path</h1>
        <p className="text-slate-500">Goal: {pathData.goal}</p>
        <div className="flex items-center justify-center gap-4 pt-4 max-w-md mx-auto">
          <span className="text-sm font-medium">Overall Progress</span>
          <Progress value={pathData.overall_progress} className="h-2 flex-1" />
          <span className="text-sm font-bold text-primary">{pathData.overall_progress.toFixed(0)}%</span>
        </div>
      </div>

      <div className="relative pt-8">
        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-slate-200" />
        
        <div className="space-y-6">
          {pathData.items.map((item, idx) => (
            <div key={item.topic_id} className="relative flex items-center gap-6">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border-2 border-slate-100">
                {getStatusIcon(item.status)}
              </div>
              
              <Card className={`flex-1 transition-all ${getStatusColor(item.status)}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardDescription className="text-xs font-semibold tracking-wider uppercase">Module {idx + 1}</CardDescription>
                      <CardTitle className="text-lg mt-1">{item.topic}</CardTitle>
                    </div>
                    <span className="text-sm font-bold">{item.mastery.toFixed(0)}% Mastery</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{item.reason}</p>
                  {(item.status === 'current' || item.status === 'in_progress') && (
                    <Link href={`/practice?topic_id=${item.topic_id}`}>
                      <Button size="sm" className="w-full sm:w-auto">
                        <GraduationCap className="h-4 w-4 mr-2" /> Study Now
                      </Button>
                    </Link>
                  )}
                  {item.status === 'done' && (
                    <Link href={`/practice?topic_id=${item.topic_id}`}>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto border-green-300 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Review Practice
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
