import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 1. Lazy initialize to read storage once. 
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("echo_theme") || "system";
  });

  // 2. New state to track the *actual* resolved color scheme (true = dark)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      // Clean previous classes
      root.classList.remove("light", "dark");

      let effectiveTheme = theme;
      
      // If system, resolve to actual preference
      if (theme === "system") {
        effectiveTheme = mediaQuery.matches ? "dark" : "light";
      }

      root.classList.add(effectiveTheme);
      
      // Update boolean state for components to use
      setIsDarkMode(effectiveTheme === "dark");
    }

    applyTheme();

    // Persist to storage
    localStorage.setItem("echo_theme", theme);

    // Listen for system changes ONLY if in system mode
    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  return (
    // Expose isDarkMode to the rest of the app
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}