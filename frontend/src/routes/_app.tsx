import { useState, useEffect } from "react";
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { BottomNav } from "@/components/BottomNav";
import { Bell, Search, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // New users (incl. Google sign-up) land here without a profile row yet — send them to onboarding once.
  const { isError: noProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
    enabled: sessionChecked && !!user,
  });

  useEffect(() => {
    if (sessionChecked && !user) {
      navigate({ to: "/auth" });
    }
  }, [sessionChecked, user, navigate]);

  useEffect(() => {
    if (sessionChecked && user && !profileLoading && noProfile && pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
  }, [sessionChecked, user, profileLoading, noProfile, pathname, navigate]);

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
        <main className="flex-1 px-6 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
