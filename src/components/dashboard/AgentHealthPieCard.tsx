import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentHealthSummary } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { Activity, ShieldCheck, AlertTriangle, XCircle, ArrowUpRight } from "lucide-react";

interface AgentHealthPieCardProps {
  agentSummary: AgentHealthSummary;
  className?: string;
  isCompact?: boolean;
}

const HEALTH_COLORS = {
  active: "#10B981",    // Emerald
  degraded: "#F59E0B",  // Amber
  offline: "#EF4444",   // Red/Rose
} as const;

export function AgentHealthPieCard({
  agentSummary,
  className,
  isCompact = false,
}: AgentHealthPieCardProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const total = agentSummary?.total || 5;
  const active = agentSummary?.active ?? 4;
  const degraded = agentSummary?.degraded ?? 1;
  const offline = agentSummary?.offline ?? 0;

  const activePercent = Math.round((active / (total || 1)) * 100);

  const chartData = useMemo(() => {
    return [
      { name: "Active (Healthy)", key: "active", value: active, color: HEALTH_COLORS.active },
      { name: "Degraded", key: "degraded", value: degraded, color: HEALTH_COLORS.degraded },
      { name: "Offline", key: "offline", value: offline, color: HEALTH_COLORS.offline },
    ].filter(item => item.value > 0);
  }, [active, degraded, offline]);

  const filteredAgents = useMemo(() => {
    if (!agentSummary?.agents) return [];
    if (!activeFilter) return agentSummary.agents;
    return agentSummary.agents.filter(a => {
      const s = a.health?.toLowerCase() || a.status?.toLowerCase();
      return s === activeFilter;
    });
  }, [agentSummary, activeFilter]);

  return (
    <Card
      variant="surface"
      interactive={false}
      className={cn("flex h-full flex-col", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-base font-semibold">Agent Health</CardTitle>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="font-semibold text-foreground">{active}</span>
          <span>/</span>
          <span>{total} online</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-5 pt-1">
        {/* Donut Chart with Center Metric */}
        <div className="relative flex items-center justify-center py-1">
          <div className="h-44 w-full max-w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.key}`}
                      fill={entry.color}
                      className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
                      onClick={() => setActiveFilter(activeFilter === entry.key ? null : entry.key)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const item = payload[0];
                    const percent = Math.round(((item.value as number) / total) * 100);
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md">
                        <div className="font-medium text-popover-foreground flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.payload.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground font-mono">
                          {item.value} agent{item.value !== 1 ? "s" : ""} ({percent}%)
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Centered Percent Display */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {activePercent}%
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Healthy
            </span>
          </div>
        </div>

        {/* Status Breakdown Legend & Interactive Filter */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === "active" ? null : "active")}
            className={cn(
              "rounded-lg border p-2 transition-all text-left",
              activeFilter === "active"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                : "border-border/50 bg-muted/20 hover:bg-muted/40 text-foreground"
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="truncate">Healthy</span>
            </div>
            <div className="mt-1 text-base font-bold font-mono text-emerald-500">
              {active}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === "degraded" ? null : "degraded")}
            className={cn(
              "rounded-lg border p-2 transition-all text-left",
              activeFilter === "degraded"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                : "border-border/50 bg-muted/20 hover:bg-muted/40 text-foreground"
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="truncate">Degraded</span>
            </div>
            <div className="mt-1 text-base font-bold font-mono text-amber-500">
              {degraded}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === "offline" ? null : "offline")}
            className={cn(
              "rounded-lg border p-2 transition-all text-left",
              activeFilter === "offline"
                ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
                : "border-border/50 bg-muted/20 hover:bg-muted/40 text-foreground"
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">Offline</span>
            </div>
            <div className="mt-1 text-base font-bold font-mono text-muted-foreground">
              {offline}
            </div>
          </button>
        </div>

        {/* Detailed Node Items */}
        {!isCompact && (
          <div className="mt-1 space-y-1.5 border-t border-border/40 pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Agent Nodes {activeFilter && `(${activeFilter})`}</span>
              <Link
                to="/nodes"
                className="text-primary hover:underline flex items-center gap-0.5 text-[11px] font-medium"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {filteredAgents.slice(0, 4).map((agent) => (
                <Link
                  key={agent.id}
                  to={`/nodes/${agent.id}`}
                  className="group flex items-center justify-between rounded-md p-2 text-xs border border-border/40 hover:border-primary/40 bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        agent.health === "active" || agent.status === "active"
                          ? "bg-emerald-500"
                          : agent.health === "degraded" || agent.status === "degraded"
                          ? "bg-amber-500"
                          : "bg-muted-foreground"
                      )}
                    />
                    <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {agent.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-mono text-[10px] shrink-0">
                    <span>{agent.reasoners || 0} reasoners</span>
                    <span>·</span>
                    <span className="capitalize">{agent.health || agent.status || "healthy"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
