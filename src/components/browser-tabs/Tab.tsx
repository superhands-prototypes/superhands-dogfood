import { X } from "lucide-react";

interface TabProps {
  id: string;
  label: string;
  isActive: boolean;
  isLocal?: boolean;
  isNewTab?: boolean;
  isCloseable?: boolean;
  onClick: () => void;
  onClose: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

export function Tab({
  label,
  isActive,
  isLocal = false,
  isNewTab = false,
  isCloseable = true,
  onClick,
  onClose,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggable = true,
}: TabProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <button
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 px-3 py-2 text-sm font-medium
        transition-all w-[180px] shrink-0 h-10
        ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
        ${
          isActive
            ? isNewTab
              ? "bg-background text-foreground rounded-t-lg border-l border-t border-r border-border border-b-0 z-30 -mb-px"
              : "bg-card text-foreground rounded-t-lg border-l border-t border-r border-border border-b-0 z-30 -mb-px"
            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted rounded-t-lg border-l border-t border-r border-transparent z-10 -mb-px"
        }
      `}
    >
      {/* Local indicator */}
      {isLocal && (
        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
      )}

      {/* Label */}
      <span className="truncate min-w-0 flex-1 text-left">
        {label}
      </span>

      {/* Close button */}
      {isCloseable && (
        <span
          onClick={handleClose}
          className={`
            p-0.5 rounded hover:bg-secondary shrink-0 cursor-pointer
            transition-opacity
            ${isActive ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"}
          `}
          role="button"
          aria-label={`Close ${label} tab`}
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
