export type UniLevel = "reach" | "match" | "safety";

export const LEVEL_META: Record<UniLevel, { label: string; tone: string; desc: string }> = {
  reach:  { label: "Reach",  tone: "bg-rose-500/10 text-rose-600 border-rose-500/20",       desc: "Амбициозная цель — шанс ниже среднего" },
  match:  { label: "Match",  tone: "bg-amber-500/10 text-amber-600 border-amber-500/20",    desc: "Подходишь по профилю" },
  safety: { label: "Safety", tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", desc: "Высокая вероятность поступления" },
};
