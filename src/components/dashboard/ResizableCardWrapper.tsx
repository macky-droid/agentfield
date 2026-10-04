import React from "react";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type CardWidth = "small" | "medium" | "large" | "full";

export interface ResizableCardWrapperProps {
  id: string;
  title: string;
  width: CardWidth;
  isCustomizing: boolean;
  onResize: (id: string, width: CardWidth) => void;
  onMove: (id: string, direction: "prev" | "next") => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

export const WIDTH_SPAN_CLASSES: Record<CardWidth, string> = {
  small: "col-span-12 md:col-span-6 lg:col-span-4",   // 1/3 width on desktop
  medium: "col-span-12 md:col-span-6 lg:col-span-6",  // 1/2 width on desktop
  large: "col-span-12 md:col-span-12 lg:col-span-8",  // 2/3 width on desktop
  full: "col-span-12",                               // Full width
};

export const WIDTH_LABELS: Record<CardWidth, string> = {
  small: "1/3",
  medium: "1/2",
  large: "2/3",
  full: "Full",
};

export function ResizableCardWrapper({
  id,
  title,
  width,
  isCustomizing,
  onResize,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  children,
  isFirst = false,
  isLast = false,
  className
}: ResizableCardWrapperProps) {
  const [isDraggedOver, setIsDraggedOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(true);
    onDragOver?.(e);
  };

  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
    onDrop?.(e, id);
  };

  const cycleNextSize = () => {
    const sequence: CardWidth[] = ["small", "medium", "large", "full"];
    const currentIndex = sequence.indexOf(width);
    const nextWidth = sequence[(currentIndex + 1) % sequence.length];
    onResize(id, nextWidth);
  };

  return (
    <div
      draggable={isCustomizing}
      onDragStart={(e) => onDragStart?.(e, id)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative flex flex-col transition-all duration-200",
        WIDTH_SPAN_CLASSES[width],
        isCustomizing && "ring-1 ring-primary/30 rounded-xl bg-card/40 cursor-grab active:cursor-grabbing",
        isDraggedOver && "ring-2 ring-primary bg-primary/5 scale-[0.99]",
        className
      )}
    >
      {/* Top Floating Controls Bar */}
      <div
        className={cn(
          "flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-mono border-x border-t transition-opacity",
          isCustomizing
            ? "bg-muted/70 border-primary/20 opacity-100"
            : "bg-background/80 backdrop-blur border-border/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        )}
      >
        {/* Left: Drag Handle & Reorder */}
        <div className="flex items-center gap-1">
          <div
            title="Drag to rearrange"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing px-1 py-0.5"
          >
            <GripVertical className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium font-sans truncate max-w-[120px]">{title}</span>
          </div>

          <div className="flex items-center gap-0.5 ml-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFirst}
              onClick={() => onMove(id, "prev")}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Move left/up"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLast}
              onClick={() => onMove(id, "next")}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Move right/down"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Right: Width Selector Buttons */}
        <div className="flex items-center gap-1">
          {(["small", "medium", "large", "full"] as CardWidth[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onResize(id, w)}
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors",
                width === w
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={`Set width to ${WIDTH_LABELS[w]}`}
            >
              {WIDTH_LABELS[w]}
            </button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cycleNextSize}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground ml-0.5"
            title="Cycle size"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}
