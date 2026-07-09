export type UniLevel = "reach" | "match" | "safety";

export type University = {
  id: string;
  name: string;
  country: string;
  qs_rank: number | null;
  acceptance_rate: number | null;
  sat_25th: number | null;
  sat_75th: number | null;
  avg_gpa: number | null;
  min_ielts: number | null;
  min_toefl: number | null;
  majors: string[];
  deadline: string | null;
  tuition_usd: number | null;
  has_scholarship: boolean;
};

export type MatchResult = {
  university: University;
  match_score: number;
  category: UniLevel;
  reasons: string[];
};

export type MyListItem = {
  id: string;
  student_id: string;
  university_id: string;
  category: UniLevel | null;
  match_score: number | null;
  added_at: string;
  universities: University;
};

export type Profile = {
  id: string;
  full_name: string | null;
  school: string | null;
  grade: number | null;
  city: string | null;
  major: string | null;
  target_countries: string[] | null;
  gpa: number | null;
  gpa_scale: number;
  sat_total: number | null;
  sat_math: number | null;
  sat_ebrw: number | null;
  ielts: number | null;
  toefl: number | null;
  activities_count: number;
  awards_count: number;
};

export type Deadline = {
  id: string;
  student_id: string;
  title: string;
  source_type: string | null;
  source_id: string | null;
  due_date: string;
  category: string | null;
  completed: boolean;
  created_at: string;
};

// UI helpers

export function formatAcceptance(rate: number | null): string {
  if (rate == null) return "—";
  return `${Math.round(rate * 100)}%`;
}

export function formatTuition(usd: number | null): string {
  if (usd == null) return "—";
  if (usd < 1000) return `$${usd}/год`;
  return `$${Math.round(usd / 1000)}k/год`;
}

export function uniTags(u: University, highlightMajor?: string | null): string[] {
  if (highlightMajor && u.majors.some((m) => m.toLowerCase() === highlightMajor.toLowerCase())) {
    const rest = u.majors.filter((m) => m.toLowerCase() !== highlightMajor.toLowerCase());
    return [highlightMajor, ...rest].slice(0, 3);
  }
  return u.majors.slice(0, 3);
}

export function uniBlurb(u: University): string {
  const parts: string[] = [];
  if (u.qs_rank) parts.push(`QS #${u.qs_rank}`);
  if (u.acceptance_rate != null) parts.push(`${formatAcceptance(u.acceptance_rate)} acceptance`);
  if (u.has_scholarship) parts.push("есть стипендии");
  return parts.join(" · ") || u.name;
}
