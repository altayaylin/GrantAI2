import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Settings, CalendarClock, GraduationCap, Compass } from "lucide-react";

// Same 5 destinations as DashboardSidebar's primary nav, same order, same icons —
// kept in sync manually since one is a vertical list and the other a fixed grid.
const items = [
  { title: "Обзор", url: "/dashboard", icon: LayoutDashboard },
  { title: "Профиль", url: "/profile", icon: Settings },
  { title: "Дедлайны", url: "/deadlines", icon: CalendarClock },
  { title: "Вузы", url: "/universities", icon: GraduationCap },
  { title: "Активности", url: "/opportunities", icon: Compass },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const active = pathname === item.url;
        return (
          <Link
            key={item.url}
            to={item.url}
            className="flex min-h-[56px] flex-col items-center justify-center gap-1"
          >
            <item.icon
              className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`whitespace-nowrap text-[10px] font-medium leading-none transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
