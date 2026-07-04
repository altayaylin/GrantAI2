import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock, CheckCircle2, Circle, Clock, GraduationCap,
  Loader2, Plus, Trash2, AlertCircle, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { Deadline } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/deadlines")({
  component: DeadlinesPage,
});

function daysUntil(due: string) {
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function formatDue(due: string) {
  const diff = daysUntil(due);
  if (diff < 0) return `Просрочен на ${Math.abs(diff)} дн`;
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  return `Через ${diff} дн`;
}

function DeadlinesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");

  const { data: deadlines = [], isLoading, error } = useQuery({
    queryKey: ["deadlines"],
    queryFn: () => api.deadlines.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.deadlines.update(id, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deadlines"] }),
    onError: () => toast.error("Не удалось обновить дедлайн"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deadlines.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deadlines"] });
      toast.success("Дедлайн удалён");
    },
    onError: () => toast.error("Не удалось удалить дедлайн"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.deadlines.create({
        title: title.trim(),
        due_date: dueDate,
        category: category.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deadlines"] });
      toast.success("Дедлайн добавлен");
      setOpen(false);
      setTitle("");
      setDueDate("");
      setCategory("");
    },
    onError: () => toast.error("Не удалось создать дедлайн"),
  });

  const pending = useMemo(
    () =>
      [...deadlines]
        .filter((d: Deadline) => !d.completed)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()),
    [deadlines],
  );
  const completed = useMemo(
    () => [...deadlines].filter((d: Deadline) => d.completed),
    [deadlines],
  );

  const nextDeadline = pending[0];
  const overdueCount = pending.filter((d) => daysUntil(d.due_date) < 0).length;

  if (error) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-destructive">
        <AlertCircle className="h-5 w-5" /> Ошибка загрузки: бэкенд недоступен.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[32px] p-8 lg:p-12 text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0F3269 0%, #1A4D9C 100%)" }}
      >
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <CalendarClock className="h-full w-full rotate-12 transform scale-125" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <CalendarClock className="h-3 w-3" /> ПЛАН ПОДАЧИ
            </div>
            <h1 className="font-display text-4xl font-extrabold lg:text-5xl leading-tight">
              Дедлайны
            </h1>
            <p className="mt-4 text-base text-blue-100/80 leading-relaxed lg:text-lg">
              Дедлайны появляются автоматически, когда ты добавляешь вуз во вкладке{" "}
              <Link to="/universities" className="underline underline-offset-2 hover:text-white">
                «Университеты»
              </Link>
              . Здесь же можно добавить и свои задачи вручную.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Stat label="ВСЕГО" value={isLoading ? "…" : deadlines.length} />
            <div className="h-10 w-px bg-white/10 hidden sm:block" />
            <Stat label="АКТИВНЫХ" value={isLoading ? "…" : pending.length} />
            <Stat label="ПРОСРОЧЕНО" value={isLoading ? "…" : overdueCount} />
            <Stat label="ВЫПОЛНЕНО" value={isLoading ? "…" : completed.length} />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {nextDeadline
            ? `Ближайший дедлайн: ${nextDeadline.title} · ${formatDue(nextDeadline.due_date)}`
            : "Активных дедлайнов нет."}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Добавить дедлайн
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый дедлайн</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim() || !dueDate) return;
                createMutation.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="dl-title">Название</Label>
                <Input
                  id="dl-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Эссе для Stanford"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dl-date">Дата</Label>
                  <Input
                    id="dl-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dl-category">Категория</Label>
                  <Input
                    id="dl-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Эссе, Тест…"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">Отмена</Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending || !title.trim() || !dueDate}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Загружаем дедлайны…
        </div>
      ) : deadlines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
          <GraduationCap className="h-10 w-10 text-muted-foreground/60 mb-4" />
          <h2 className="text-lg font-semibold">Пока нет дедлайнов</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Добавь университеты в свой список — для каждого с известным дедлайном подачи задача появится здесь автоматически.
          </p>
          <Button asChild size="sm" className="mt-5">
            <Link to="/universities">
              Перейти к университетам <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <DeadlineGroup
            title="Активные"
            items={pending}
            onToggle={(id, completed) => toggleMutation.mutate({ id, completed })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          {completed.length > 0 && (
            <DeadlineGroup
              title="Выполненные"
              items={completed}
              onToggle={(id, completed) => toggleMutation.mutate({ id, completed })}
              onDelete={(id) => deleteMutation.mutate(id)}
              muted
            />
          )}
        </div>
      )}
    </div>
  );
}

function DeadlineGroup({
  title, items, onToggle, onDelete, muted,
}: {
  title: string;
  items: Deadline[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground py-3">Нет задач в этой категории.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-semibold mb-4">{title} <span className="text-muted-foreground font-normal">({items.length})</span></h2>
      <ul className="space-y-1">
        {items.map((d) => {
          const due = formatDue(d.due_date);
          const overdue = !d.completed && daysUntil(d.due_date) < 0;
          const urgent = !d.completed && !overdue && daysUntil(d.due_date) <= 2;
          const fromUniversity = d.source_type === "university";
          return (
            <li
              key={d.id}
              className="group flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <button onClick={() => onToggle(d.id, !d.completed)} className="shrink-0">
                {d.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <span className={`flex-1 min-w-0 text-sm truncate ${d.completed || muted ? "line-through text-muted-foreground" : ""}`}>
                {d.title}
              </span>
              {fromUniversity && (
                <Badge variant="secondary" className="gap-1 font-normal shrink-0">
                  <GraduationCap className="h-3 w-3" /> Вуз
                </Badge>
              )}
              {d.category && !fromUniversity && (
                <Badge variant="outline" className="font-normal shrink-0">{d.category}</Badge>
              )}
              <span className={`text-xs flex items-center gap-1 shrink-0 ${overdue ? "text-destructive font-medium" : urgent ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                <Clock className="h-3 w-3" /> {due}
              </span>
              <button
                onClick={() => onDelete(d.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                title="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-[11px] text-white/60 uppercase tracking-wider">{label}</div>
    </div>
  );
}
