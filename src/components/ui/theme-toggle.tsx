import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md",
        "border border-border bg-card hover:bg-secondary",
        "transition-colors duration-200",
        className
      )}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-all",
          resolvedTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all",
          resolvedTheme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
    </button>
  );
}
