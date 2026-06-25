import { useState, useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Bell, Search, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Алишер Н.";
  const initials = name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur flex items-center px-6 gap-4 sticky top-0 z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Поиск университетов, программ, активностей…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted/60 border border-transparent focus:border-ring focus:bg-background outline-none text-sm transition-colors"
            />
          </div>
          <button className="h-10 w-10 grid place-items-center rounded-lg hover:bg-muted transition-colors relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </button>
          
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-muted-foreground">
                {user ? "Студент" : "12 класс · CS"}
              </div>
            </div>
            <div
              className="h-9 w-9 rounded-full grid place-items-center text-white font-medium text-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              {initials}
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 h-9 w-9 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
