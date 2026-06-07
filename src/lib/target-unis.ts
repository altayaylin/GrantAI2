import { useEffect, useState } from "react";

export type UniLevel = "reach" | "match" | "safety";

export type University = {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking: number;
  acceptance: string;
  avgSAT: number;
  tuition: string;
  tags: string[];
  blurb: string;
};

export const UNIVERSITIES: University[] = [
  { id: "mit", name: "MIT", country: "США", city: "Cambridge, MA", ranking: 2, acceptance: "4%", avgSAT: 1540, tuition: "$59k/год", tags: ["CS", "Engineering", "Research"], blurb: "Лидер в инженерии и computer science." },
  { id: "stanford", name: "Stanford University", country: "США", city: "Stanford, CA", ranking: 3, acceptance: "4%", avgSAT: 1530, tuition: "$62k/год", tags: ["CS", "Business", "Entrepreneurship"], blurb: "Сердце Кремниевой долины." },
  { id: "harvard", name: "Harvard University", country: "США", city: "Cambridge, MA", ranking: 4, acceptance: "3%", avgSAT: 1520, tuition: "$57k/год", tags: ["Liberal Arts", "Law", "Research"], blurb: "Старейший университет США с сильным need-based aid." },
  { id: "cmu", name: "Carnegie Mellon", country: "США", city: "Pittsburgh, PA", ranking: 25, acceptance: "11%", avgSAT: 1510, tuition: "$61k/год", tags: ["CS", "AI", "Robotics"], blurb: "№1 в США по computer science для бакалавриата." },
  { id: "berkeley", name: "UC Berkeley", country: "США", city: "Berkeley, CA", ranking: 10, acceptance: "11%", avgSAT: 1450, tuition: "$45k/год (out-of-state)", tags: ["CS", "Engineering", "Public"], blurb: "Топ-публичный университет с сильной CS-школой." },
  { id: "cambridge", name: "University of Cambridge", country: "Великобритания", city: "Cambridge", ranking: 5, acceptance: "21%", avgSAT: 1500, tuition: "£38k/год", tags: ["Math", "CS", "Research"], blurb: "Один из старейших и сильнейших университетов мира." },
  { id: "oxford", name: "University of Oxford", country: "Великобритания", city: "Oxford", ranking: 3, acceptance: "17%", avgSAT: 1500, tuition: "£39k/год", tags: ["PPE", "CS", "Research"], blurb: "Tutorial-система и исследовательская мощь." },
  { id: "imperial", name: "Imperial College London", country: "Великобритания", city: "London", ranking: 6, acceptance: "14%", avgSAT: 1480, tuition: "£40k/год", tags: ["Engineering", "CS", "Medicine"], blurb: "STEM-фокус, лондонская локация." },
  { id: "eth", name: "ETH Zürich", country: "Швейцария", city: "Цюрих", ranking: 7, acceptance: "27%", avgSAT: 1450, tuition: "CHF 1.5k/семестр", tags: ["Engineering", "CS", "Affordable"], blurb: "Лучший технический университет континентальной Европы." },
  { id: "epfl", name: "EPFL", country: "Швейцария", city: "Лозанна", ranking: 26, acceptance: "30%", avgSAT: 1420, tuition: "CHF 1.5k/семестр", tags: ["Engineering", "CS", "Affordable"], blurb: "Франкоязычный аналог ETH." },
  { id: "tudelft", name: "TU Delft", country: "Нидерланды", city: "Делфт", ranking: 47, acceptance: "55%", avgSAT: 1380, tuition: "€20k/год", tags: ["Engineering", "Design"], blurb: "Сильная инженерия с доступной стоимостью." },
  { id: "nus", name: "NUS", country: "Сингапур", city: "Сингапур", ranking: 8, acceptance: "5%", avgSAT: 1500, tuition: "S$38k/год", tags: ["CS", "Business", "Asia"], blurb: "Ведущий университет Азии." },
  { id: "toronto", name: "University of Toronto", country: "Канада", city: "Торонто", ranking: 21, acceptance: "43%", avgSAT: 1420, tuition: "CA$62k/год", tags: ["CS", "AI", "Research"], blurb: "Колыбель современного deep learning." },
  { id: "tsinghua", name: "Tsinghua University", country: "Китай", city: "Пекин", ranking: 12, acceptance: "2%", avgSAT: 1500, tuition: "¥40k/год", tags: ["Engineering", "CS"], blurb: "MIT Восточной Азии." },
];

const KEY = "target-unis-v1";

export type TargetUni = { id: string; level: UniLevel };

function read(): TargetUni[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: TargetUni[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("target-unis-change"));
}

export function useTargetUnis() {
  const [list, setList] = useState<TargetUni[]>(() => read());

  useEffect(() => {
    const sync = () => setList(read());
    window.addEventListener("target-unis-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("target-unis-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = (id: string, level: UniLevel = "match") => {
    const current = read();
    const exists = current.find((u) => u.id === id);
    const next = exists ? current.filter((u) => u.id !== id) : [...current, { id, level }];
    write(next);
  };

  const setLevel = (id: string, level: UniLevel) => {
    const next = read().map((u) => (u.id === id ? { ...u, level } : u));
    write(next);
  };

  return { list, toggle, setLevel };
}

export const LEVEL_META: Record<UniLevel, { label: string; tone: string; desc: string }> = {
  reach: { label: "Reach", tone: "bg-rose-500/10 text-rose-600 border-rose-500/20", desc: "Амбициозная цель — шанс ниже среднего" },
  match: { label: "Match", tone: "bg-amber-500/10 text-amber-600 border-amber-500/20", desc: "Подходишь по профилю" },
  safety: { label: "Safety", tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", desc: "Высокая вероятность поступления" },
};
