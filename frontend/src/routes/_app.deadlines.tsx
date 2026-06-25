import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Timer, Sparkles, Hammer } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/deadlines")({
  component: DeadlinesPage,
});

function DeadlinesPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[32px] bg-[#0F3269] p-8 lg:p-12 text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0F3269 0%, #1A4D9C 100%)" }}
      >
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <CalendarClock className="h-full w-full rotate-12 transform scale-125" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            <Timer className="h-3 w-3" /> СКОРО В ОБНОВЛЕНИИ
          </div>
          <h1 className="font-display text-4xl font-extrabold lg:text-5xl leading-tight">
            Дедлайны
          </h1>
          <p className="mt-4 text-base text-blue-100/80 leading-relaxed lg:text-lg">
            Умный календарь, который не даст пропустить подачу документов. AI будет напоминать о важных датах и помогать распределять нагрузку.
          </p>
        </div>
      </section>

      {/* In Development Content */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="h-32 w-32 rounded-[40px] bg-blue-50 grid place-items-center mb-8 relative">
            <Hammer className="h-12 w-12 text-[#0F3269]" />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-[40px] border-2 border-dashed border-blue-200" 
            />
          </div>
          
          <div className="absolute -top-4 -right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border border-amber-200">
             IN DEV
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold font-display text-foreground">Страница в разработке</h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          Мы работаем над тем, чтобы сделать отслеживание дедлайнов максимально удобным. Совсем скоро здесь появится интерактивный календарь и система уведомлений.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
           <FeaturePreview 
             icon={Sparkles} 
             title="AI Напоминания" 
             desc="Персональные пуши под твой часовой пояс"
           />
           <FeaturePreview 
             icon={CalendarClock} 
             title="Timeline" 
             desc="Визуальный план на весь год поступления"
           />
           <FeaturePreview 
             icon={Timer} 
             title="Авто-дедлайны" 
             desc="Синхронизация с датами вузов напрямую"
           />
        </div>
      </div>
    </div>
  );
}

function FeaturePreview({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card/50 hover:border-blue-200 transition-colors text-left flex flex-col gap-3">
       <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1A4D9C]">
          <Icon className="h-5 w-5" />
       </div>
       <div>
         <div className="font-bold text-sm text-foreground">{title}</div>
         <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
       </div>
    </div>
  );
}

export default DeadlinesPage;
