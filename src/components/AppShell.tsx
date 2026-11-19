import { Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useDarkMode } from "@/hooks/useDarkMode";

const AppShell = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex flex-shrink-0 items-center justify-between bg-[hsl(var(--ink))] px-5 py-3 text-white">
        <span className="font-marker text-3xl">
          <span>study</span>
          <span className="text-[hsl(var(--sticky))]">spot</span>
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="h-11 w-11 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppShell;
