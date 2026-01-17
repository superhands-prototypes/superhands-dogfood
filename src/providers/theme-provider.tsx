import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or default to system
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
      setThemeState(stored);
    } else {
      setThemeState("system");
    }
  }, []);

  // Update resolved theme based on current theme preference
  useEffect(() => {
    if (!mounted) return;

    let currentResolvedTheme: ResolvedTheme;
    if (theme === "system") {
      currentResolvedTheme = getSystemTheme();
    } else {
      currentResolvedTheme = theme;
    }

    setResolvedTheme(currentResolvedTheme);

    const root = document.documentElement;
    if (currentResolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Only save to localStorage if it's a manual override (not system)
    if (theme !== "system") {
      localStorage.setItem("theme", theme);
    } else {
      // Remove from localStorage to use system preference
      localStorage.removeItem("theme");
    }
  }, [theme, mounted]);

  // Listen for system theme changes when using system preference
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newResolvedTheme = e.matches ? "dark" : "light";
      setResolvedTheme(newResolvedTheme);

      const root = document.documentElement;
      if (newResolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    // Set initial value
    handleChange(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === "system") {
        // If currently system, toggle to the opposite of current resolved theme
        return resolvedTheme === "dark" ? "light" : "dark";
      } else if (prev === "dark") {
        return "light";
      } else {
        return "dark";
      }
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Always wrap in provider, but hide content until mounted to prevent flash
  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
