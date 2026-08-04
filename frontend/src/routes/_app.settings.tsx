import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, UserCog, Mail, Sparkles, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const { data: billingStatus, isLoading: statusLoading } = useQuery({
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    toast.info("Вы вышли из аккаунта. Войдите под другим профилем.");
    navigate({ to: "/auth" });
  };

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Профиль";
  const initials = name.charAt(0).toUpperCase();
  const isPro = billingStatus?.is_pro ?? false;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-1">Управление аккаунтом и подпиской</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Аккаунт
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-full grid place-items-center text-white font-semibold text-base shrink-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {user?.email ?? "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Подписка
        </h2>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Текущий план:</span>
              {statusLoading ? (
                <span className="text-xs text-muted-foreground">Загрузка...</span>
              ) : isPro ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle className="h-3 w-3" /> Naviuni Pro
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Free (Базовый)
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isPro
                ? "Вам доступны все преимущества AI подбора университетов и приоритетная обработка документов."
                : "Перейдите на Pro для доступа к неограниченному AI подбору и расширенным аналитическим возможностям."}
            </p>
          </div>

          {!isPro && (
            <Button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              className="gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {checkoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {checkoutMutation.isPending ? "Создание оплаты..." : "Оформить Pro"}
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Сессия
        </h2>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-medium">Сменить аккаунт</div>
            <div className="text-sm text-muted-foreground">Выйти и войти под другим профилем</div>
          </div>
          <Button variant="outline" onClick={handleSwitchAccount} className="gap-2">
            <UserCog className="h-4 w-4" /> Сменить аккаунт
          </Button>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-medium">Выйти из аккаунта</div>
            <div className="text-sm text-muted-foreground">
              Завершить текущую сессию на этом устройстве
            </div>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Выйти
          </Button>
        </div>
      </section>
    </div>
  );
}
export default SettingsPage;

