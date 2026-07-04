import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Как это работает", href: "#how-it-works" },
    { name: "Возможности", href: "#features" },
    { name: "Сравнение", href: "#comparison" },
    { name: "Тарифы", href: "#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--bg-base)]/70 backdrop-blur-md border-b border-[var(--border)] py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img 
            src="/logo.png" 
            alt="GrantAI Logo" 
            className="h-9 w-9 object-contain rounded-xl transition-transform group-hover:scale-105" 
          />
          <div className="leading-tight">
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">
              GrantAI
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/auth"
            className="bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] flex items-center gap-1.5"
          >
            Войти <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[var(--text-primary)] p-1.5 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[var(--bg-base)] border-b border-[var(--border)] overflow-hidden"
          >
            <div className="px-6 pt-2 pb-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base text-[var(--text-secondary)] py-2 border-b border-[var(--border)]/50 hover:text-[var(--text-primary)]"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full justify-center bg-[var(--accent)] text-white text-sm font-semibold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 mt-2"
              >
                Войти <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
