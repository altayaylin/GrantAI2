import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/confirm-email")({
  component: ConfirmEmailPage,
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
});

function ConfirmEmailPage() {
  const { email } = Route.useSearch();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: window.location.origin + "/dashboard" },
      });
      if (error) throw error;
      toast.success("Письмо отправлено повторно");
    } catch (err: any) {
      toast.error(err.message || "Не удалось отправить письмо");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="landing-theme min-h-screen flex flex-col justify-between py-8 px-4 relative overflow-hidden">
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[rgba(79,142,247,0.1)] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[rgba(123,110,246,0.08)] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full px-4 mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Вернуться на главную
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center my-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-[var(--accent-glow)] grid place-items-center">
            <Mail className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            Подтвердите почту
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-3">
            Мы отправили письмо со ссылкой для подтверждения
            {email ? (
              <>
                {" "}
                на <span className="text-[var(--text-primary)] font-medium">{email}</span>
              </>
            ) : (
              ""
            )}
            . Перейдите по ссылке из письма, чтобы попасть в личный кабинет.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            Не пришло письмо? Проверьте папку «Спам» или отправьте ещё раз.
          </p>
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="mt-6 w-full h-11 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] disabled:opacity-50"
          >
            {resending ? "Отправляем..." : "Отправить письмо ещё раз"}
          </button>
          <div className="mt-4 text-xs text-[var(--text-secondary)]">
            <Link to="/auth" className="text-[var(--accent)] font-semibold hover:underline">
              Уже подтвердили? Войти
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[var(--text-muted)] mt-8">
        © {new Date().getFullYear()} Naviuni. Все права защищены.
      </div>
    </div>
  );
}
export default ConfirmEmailPage;
