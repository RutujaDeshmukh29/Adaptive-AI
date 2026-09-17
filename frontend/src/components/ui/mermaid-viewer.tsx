"use client";

import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";
import { Loader2, AlertCircle, Maximize2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MermaidViewerProps {
  chart: string;
}

export function MermaidViewer({ chart }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, "_");

  useEffect(() => {
    let isMounted = true;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      });
    } catch (e) {
      console.warn("Mermaid re-init:", e);
    }

    const renderChart = async () => {
      try {
        setLoading(true);
        setError(null);
        const renderId = `mermaid_${uniqueId}_${Math.random().toString(36).substring(2, 7)}`;
        const { svg: renderedSvg } = await mermaid.render(renderId, chart);
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Mermaid render error:", err);
          setError("Diagram syntax could not be rendered as SVG.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="my-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-center gap-2.5 text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Rendering visual diagram...</span>
      </div>
    );
  }

  if (error || !svg) {
    return (
      <div className="my-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs">
        <div className="flex items-center justify-between gap-2 text-amber-800 font-medium mb-1.5">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Diagram Code
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-6 px-2 text-[11px] text-amber-900 hover:bg-amber-100"
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="px-3 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-medium text-slate-700 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Interactive Diagram (Mermaid.js)
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="h-6 px-2 text-[11px] text-slate-600 hover:text-slate-900"
        >
          {copied ? <Check className="h-3 w-3 mr-1 text-emerald-600" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? "Copied Source" : "Copy Code"}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto flex justify-center bg-white">
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svg }}
          className="w-full max-w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        />
      </div>
    </div>
  );
}
