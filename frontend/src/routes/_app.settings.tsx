import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, UserCog, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-1">Управление аккаунтом и сессией</p>
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
