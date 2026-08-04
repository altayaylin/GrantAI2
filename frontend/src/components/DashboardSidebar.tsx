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
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

  const { data: billingStatus } = useQuery({
    queryKey: ["billing-status"],
    queryFn: () => api.billing.status(),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => api.billing.checkout(),
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Не удалось получить ссылку на оплату");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка при создании сессии оплаты");
    },
  });

  const isPro = billingStatus?.is_pro ?? false;

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

      {/* Pro Badge / Upgrade Prompt */}
      <div className="px-3 py-3">
        {isPro ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span className="font-semibold">Naviuni Pro активен</span>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Перейди на Pro</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Неограниченный AI подбор и аналитика университетов.
            </p>
            <button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              {checkoutMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {checkoutMutation.isPending ? "Загрузка..." : "Оформить Pro"}
            </button>
          </div>
        )}
      </div>

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

