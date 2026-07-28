import { Link } from "@tanstack/react-router";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-base)] text-[var(--text-secondary)] py-16 border-t border-[var(--border)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12 mb-12 border-b border-[var(--border)]/50">
          {/* Col 1: Brand */}
          <div className="md:col-span-1 flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="Naviuni Logo" 
                className="h-9 w-9 object-contain rounded-xl transition-transform group-hover:scale-105" 
              />
              <span className="font-display font-bold text-lg text-[var(--text-primary)]">
                Naviuni
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-xs text-[var(--text-muted)]">
              AI-платформа для поступления в топовые зарубежные университеты. Строим будущее образования вместе.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">Продукт</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Возможности</a></li>
              <li><a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Цены</a></li>
              <li><Link to="/universities" className="hover:text-[var(--text-primary)] transition-colors">Университеты</Link></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">Компания</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="cursor-not-allowed text-[var(--text-muted)]">О нас</span></li>
              <li><span className="cursor-not-allowed text-[var(--text-muted)]">Блог</span></li>
              <li><span className="cursor-not-allowed text-[var(--text-muted)]">Карьера</span></li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">Поддержка</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a></li>
              <li><span className="cursor-not-allowed text-[var(--text-muted)]">Контакты</span></li>
              <li>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1"
                >
                  Telegram ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)]">
          <div>
            © {currentYear} Naviuni. Сделано в Казахстане 🇰🇿
          </div>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-[var(--text-secondary)]">Конфиденциальность</span>
            <span className="cursor-pointer hover:text-[var(--text-secondary)]">Условия использования</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
