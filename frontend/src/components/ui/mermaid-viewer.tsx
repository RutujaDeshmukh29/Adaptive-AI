"use client";

import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";
import { Loader2, AlertCircle, Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MermaidViewerProps {
  chart: string;
}

/**
 * Auto-sanitizes common LLM Mermaid syntax mistakes before passing to Mermaid parser.
 * E.g., unquoted parentheses inside square brackets like `A[Vector (sum)]` -> `A["Vector (sum)"]`
 */
function sanitizeMermaid(code: string): string {
  if (!code) return "";
  let clean = code.trim().replace(/^```(?:mermaid)?/i, "").replace(/```$/, "").trim();

  // If chart lacks a valid diagram declaration, default to flowchart TD
  const firstLine = clean.split("\n")[0].trim();
  const validStarters = [
    "graph", "flowchart", "sequencediagram", "classdiagram", 
    "statediagram", "erdiagram", "gantt", "pie", "gitgraph", 
    "journey", "mindmap", "timeline", "c4"
  ];
  const hasStarter = validStarters.some((s) => firstLine.toLowerCase().startsWith(s));
  if (!hasStarter) {
    clean = "flowchart TD\n" + clean;
  }

  // Sanitize line-by-line to preserve structure
  const lines = clean.split("\n");
  const processed = lines.map((line) => {
    let l = line;
    // Replace unquoted node labels with parentheses or slashes:
    // e.g. A[Vector representation (average / sum)] -> A["Vector representation (average / sum)"]
    l = l.replace(/(\b[A-Za-z0-9_]+)\[([^\]\n"]*[()\/][^\]\n"]*)\]/g, '$1["$2"]');
    // Replace unquoted diamond condition labels:
    // e.g. A{Condition (yes / no)} -> A{"Condition (yes / no)"}
    l = l.replace(/(\b[A-Za-z0-9_]+)\{([^}\n"]*[()\/][^}\n"]*)\}/g, '$1{"$2"}');
    return l;
  });

  return processed.join("\n");
}

export function MermaidViewer({ chart }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, "_");

  useEffect(() => {
    let isMounted = true;

    try {
      mermaid.initialize({
        startOnLoad: false,
        suppressErrorRendering: true,
        theme: "neutral",
        securityLevel: "loose",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      });
    } catch {
      // Ignore re-init warnings
    }

    const renderChart = async () => {
      const renderId = `mermaid_${uniqueId}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        setLoading(true);
        setError(null);
        
        const sanitized = sanitizeMermaid(chart);
        const { svg: renderedSvg } = await mermaid.render(renderId, sanitized);
        
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch {
        // Clean up any stray error element that Mermaid may have injected into DOM
        try {
          const stray = document.getElementById(renderId) || document.getElementById(`d${renderId}`);
          if (stray) stray.remove();
        } catch {
          // Ignore DOM cleanup error
        }

        if (isMounted) {
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
      <div className="my-2 p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        <span>Rendering diagram...</span>
      </div>
    );
  }

  if (error || !svg) {
    // Parse lines as human-readable steps
    const cleanedLines = chart
      .replace(/^```(?:mermaid)?/i, "")
      .replace(/```$/, "")
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("graph") && !l.startsWith("flowchart"));

    return (
      <div className="my-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4 text-xs w-full">
        <div className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-3">
          <span className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
            <AlertCircle className="h-4 w-4" />
            Diagram Architecture Flow
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRaw(!showRaw)}
              className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <Code2 className="h-3 w-3 mr-1" />
              {showRaw ? "Hide Syntax" : "View Syntax"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 mr-1 text-emerald-500" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Structured Step Cards Fallback */}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          {cleanedLines.slice(0, 6).map((step, idx) => (
            <div 
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] shadow-2xs flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>{step.replace(/[\[\]\(\)\{\}\"\']/g, " ")}</span>
            </div>
          ))}
        </div>

        {showRaw && (
          <pre className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800">
            {chart}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto flex justify-center py-2">
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: svg }}
        className="w-full max-w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto transition-all"
      />
    </div>
  );
}
