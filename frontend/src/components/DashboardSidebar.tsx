import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarClock,
  GraduationCap,
  Sparkles,
  Compass,
  Settings,
  LifeBuoy,
} from "lucide-react";

const nav = [
  { title: "Обзор", url: "/dashboard", icon: LayoutDashboard },
  { title: "Профиль", url: "/profile", icon: Settings },
  { title: "Дедлайны", url: "/deadlines", icon: CalendarClock },
  { title: "Университеты", url: "/universities", icon: GraduationCap },
  { title: "Активности", url: "/opportunities", icon: Compass },
];

const bottom = [
  { title: "Настройки", url: "/settings", icon: Settings },
  { title: "Поддержка", url: "/support", icon: LifeBuoy },
];

export function DashboardSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0 h-screen overflow-y-auto">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Naviuni Logo" className="h-9 w-9 object-contain rounded-xl shadow-[var(--shadow-glow)]" />
          <div className="leading-tight">
            <div className="font-semibold text-base">Naviuni</div>
            <div className="text-[11px] text-sidebar-foreground/60">
              Поступай умнее
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
          Основное
        </div>
        {nav.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottom.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
