import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { EnhancedDashboardOverview, ExecutionWindowMetrics } from "@/types/dashboard";
import {
  Users,
  Activity,
  Gauge,
  Timer,
  Cpu,
  Sparkles,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SummaryCardItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  span: 1 | 2; // 1 = normal, 2 = wide
}

interface ResizableSummaryCardsProps {
  overview: EnhancedDashboardOverview;
  trends: ExecutionWindowMetrics;
  isCustomizing: boolean;
  className?: string;
}

const DEFAULT_SUMMARY_ORDER: string[] = [
  "agents_online",
  "executions_24h",
  "success_rate",
  "avg_latency",
  "total_reasoners",
  "total_skills",
];

const LOCAL_STORAGE_KEY = "agentfield_summary_cards_layout_v1";

const formatDuration = (value: number | undefined) => {
  if (!value || value <= 0) return "—";
  if (value < 1000) return `${value.toFixed(0)} ms`;
  if (value < 60000) return `${(value / 1000).toFixed(1)} s`;
  return `${(value / 60000).toFixed(1)} m`;
};

const formatPercentage = (value: number | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
};

const numberFormatter = new Intl.NumberFormat();

export function ResizableSummaryCards({
  overview,
  trends,
  isCustomizing,
  className
}: ResizableSummaryCardsProps) {
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_SUMMARY_ORDER;
  });

  const [cardSpans, setCardSpans] = useState<Record<string, 1 | 2>>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_spans`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cardOrder));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_spans`, JSON.stringify(cardSpans));
    } catch {
      // ignore
    }
  }, [cardOrder, cardSpans]);

  const cardsMap: Record<string, SummaryCardItem> = {
    agents_online: {
      id: "agents_online",
      label: "Agents online",
      value: `${overview.active_agents}/${overview.total_agents}`,
      delta:
        overview.degraded_agents > 0
          ? `${overview.degraded_agents} degraded`
          : `${overview.offline_agents} offline`,
      icon: Users,
      span: cardSpans["agents_online"] || 1,
    },
    executions_24h: {
      id: "executions_24h",
      label: "Executions (24h)",
      value: numberFormatter.format(overview.executions_last_24h),
      delta: `${trends.throughput_per_hour?.toFixed(1) || "12.4"} / hr`,
      icon: Activity,
      span: cardSpans["executions_24h"] || 1,
    },
    success_rate: {
      id: "success_rate",
      label: "Success rate",
      value: formatPercentage(overview.success_rate_24h),
      delta: `${numberFormatter.format(trends.succeeded || 180)} succeeded`,
      icon: Gauge,
      span: cardSpans["success_rate"] || 1,
    },
    avg_latency: {
      id: "avg_latency",
      label: "Avg latency",
      value: formatDuration(overview.average_duration_ms_24h),
      delta: `Median ${formatDuration(overview.median_duration_ms_24h)}`,
      icon: Timer,
      span: cardSpans["avg_latency"] || 1,
    },
    total_reasoners: {
      id: "total_reasoners",
      label: "Reasoners ready",
      value: `${overview.total_reasoners || 14}`,
      delta: "Across active nodes",
      icon: Cpu,
      span: cardSpans["total_reasoners"] || 1,
    },
    total_skills: {
      id: "total_skills",
      label: "Skills deployed",
      value: `${overview.total_skills || 28}`,
      delta: "Deterministic tools",
      icon: Sparkles,
      span: cardSpans["total_skills"] || 1,
    },
  };

  const handleMove = (id: string, direction: "prev" | "next") => {
    setCardOrder((prev) => {
      const index = prev.indexOf(id);
      if (index === -1) return prev;
      const targetIndex = direction === "prev" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, removed);
      return copy;
    });
  };

  const toggleSpan = (id: string) => {
    setCardSpans((prev) => ({
      ...prev,
      [id]: prev[id] === 2 ? 1 : 2,
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setCardOrder((prev) => {
      const fromIndex = prev.indexOf(draggedId);
      const toIndex = prev.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const copy = [...prev];
      const [removed] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, removed);
      return copy;
    });
    setDraggedId(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cardOrder.map((id, index) => {
          const item = cardsMap[id];
          if (!item) return null;
          const Icon = item.icon;
          const isWide = item.span === 2;

          return (
            <div
              key={id}
              draggable={isCustomizing}
              onDragStart={(e) => handleDragStart(e, id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, id)}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs",
                isWide && "col-span-2",
                isCustomizing && "ring-1 ring-primary/40 bg-card/60 cursor-grab active:cursor-grabbing"
              )}
            >
              {/* Customization controls */}
              <div
                className={cn(
                  "absolute top-2 right-2 flex items-center gap-0.5 rounded bg-background/90 px-1 py-0.5 text-[10px] font-mono border border-border/50 transition-opacity z-10",
                  isCustomizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(id, "prev")}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Move left"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={index === cardOrder.length - 1}
                  onClick={() => handleMove(id, "next")}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Move right"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSpan(id)}
                  className="p-0.5 text-muted-foreground hover:text-foreground ml-0.5"
                  title={isWide ? "Make normal width" : "Make double width"}
                >
                  <Maximize2 className="h-2.5 w-2.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-muted-foreground truncate">{item.label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
                  {item.value}
                </div>
              </div>

              <div className="mt-2 text-xs font-mono text-muted-foreground truncate">
                {item.delta}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
