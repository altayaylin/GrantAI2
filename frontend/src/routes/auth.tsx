import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Sparkles, ArrowLeft, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type FormMode = "login" | "register";

export function AuthPage() {
  const [mode, setMode] = useState<FormMode>("register");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleModeToggle = () => {
    setMode(mode === "login" ? "register" : "login");
    reset();
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Ошибка авторизации через Google");
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });
        if (error) throw error;
        toast.success("Регистрация успешна! Проверьте email для подтверждения.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Вход выполнен успешно!");
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Произошла ошибка при входе");
    }
  };

  return (
    <div className="landing-theme min-h-screen flex flex-col justify-between py-8 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[rgba(79,142,247,0.1)] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[rgba(123,110,246,0.08)] to-transparent blur-3xl pointer-events-none" />

      {/* Header / Back to main */}
      <div className="max-w-7xl mx-auto w-full px-4 mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Вернуться на главную
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="flex-1 flex items-center justify-center my-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Logo element */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="GrantAI Logo" className="h-10 w-10 object-contain rounded-xl" />
              <span className="font-display font-bold text-xl text-[var(--text-primary)]">
                GrantAI
              </span>
            </Link>
            <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
              {mode === "login" ? "Рады видеть тебя снова!" : "Создай свой профиль"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              {mode === "login"
                ? "Войди, чтобы продолжить работу со своим планом"
                : "Начни планировать поступление в топовые вузы прямо сейчас"}
            </p>
          </div>

          {/* OAuth button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full h-11 bg-white text-black hover:bg-white/90 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-md"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Войти через Google
            </button>

            {/* Divider */}
            <div className="flex items-center mt-6">
              <div className="flex-1 h-px bg-[var(--border)]"></div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] px-3 font-semibold">или</span>
              <div className="flex-1 h-px bg-[var(--border)]"></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Имя и фамилия
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Алишер Назарбаев"
                    {...register("name", { required: mode === "register" })}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                {errors.name && (
                  <span className="text-[10px] text-[var(--danger)] mt-1 block">Это поле обязательно для заполнения</span>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="alisher@example.com"
                  {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-[var(--danger)] mt-1 block">Введите корректный email</span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Пароль
                </label>
                {mode === "login" && (
                  <span className="text-[10px] text-[var(--accent)] hover:underline cursor-pointer">
                    Забыли пароль?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: true, minLength: 6 })}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-[var(--danger)] mt-1 block">Пароль должен быть не менее 6 символов</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting ? (
                "Загрузка..."
              ) : mode === "login" ? (
                <>Войти <ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Зарегистрироваться <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Toggle state */}
          <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
            {mode === "login" ? (
              <>
                Ещё нет аккаунта?{" "}
                <button onClick={handleModeToggle} className="text-[var(--accent)] font-semibold hover:underline">
                  Создать профиль
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{" "}
                <button onClick={handleModeToggle} className="text-[var(--accent)] font-semibold hover:underline">
                  Войти в систему
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[var(--text-muted)] mt-8">
        © {new Date().getFullYear()} GrantAI. Все права защищены. Сделано в Казахстане 🇰🇿
      </div>
    </div>
  );
}
export default AuthPage;
