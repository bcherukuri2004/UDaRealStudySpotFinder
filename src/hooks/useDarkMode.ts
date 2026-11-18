import { useCallback, useEffect, useState } from "react";

/** Dark-mode state, persisted in localStorage under "theme" and mirrored as a class on <html>. */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch {
      /* storage unavailable (private mode): theme just won't persist */
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode((v) => !v), []);

  return { isDarkMode, toggleDarkMode };
}
