import { NavLink } from "react-router-dom";
import { Compass, Map, CalendarDays, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Discover", icon: Compass, end: true },
  { to: "/map", label: "Map", icon: Map, end: false },
  { to: "/events", label: "Events", icon: CalendarDays, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
] as const;

const BottomNav = () => (
  <nav
    aria-label="Main"
    className="flex-shrink-0 border-t border-border bg-card"
  >
    <ul className="mx-auto flex max-w-2xl">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <li key={to} className="flex-1">
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-base font-medium transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                 isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
               }`
            }
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default BottomNav;
