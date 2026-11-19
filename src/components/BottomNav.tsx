import { NavLink } from "react-router-dom";
import { Pin, Map, Ticket, Smile } from "lucide-react";

const TABS = [
  { to: "/", label: "Board", icon: Pin, end: true },
  { to: "/map", label: "Map", icon: Map, end: false },
  { to: "/events", label: "Events", icon: Ticket, end: false },
  { to: "/profile", label: "Me", icon: Smile, end: false },
] as const;

const BottomNav = () => (
  <nav aria-label="Main" className="flex-shrink-0 bg-[hsl(var(--ink))] text-white">
    <ul className="mx-auto flex max-w-2xl">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <li key={to} className="flex-1">
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-base font-bold transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--sticky))] ${
                 isActive
                   ? "text-[hsl(var(--sticky))] shadow-[inset_0_3px_0_hsl(var(--sticky))]"
                   : "text-white/80 hover:text-white"
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
