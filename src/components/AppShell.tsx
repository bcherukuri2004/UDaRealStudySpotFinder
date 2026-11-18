import { Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useDarkMode } from "@/hooks/useDarkMode";

const AppShell = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card/60 px-6 py-3">
        <span className="font-serif text-3xl font-semibold italic">
          studyspot<span className="text-primary">.</span>
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="h-11 w-11"
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
