import { supabase } from "@/lib/supabase";
import type { University, MatchResult, MyListItem, Profile, Deadline } from "@/lib/types";
import type { Opportunity } from "@/lib/opportunities";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  universities: {
    list: (country?: string): Promise<University[]> =>
      apiFetch(`/universities${country ? `?country=${encodeURIComponent(country)}` : ""}`),

    match: (): Promise<MatchResult[]> =>
      apiFetch("/universities/match"),

    myList: (): Promise<MyListItem[]> =>
      apiFetch("/universities/my-list"),

    add: (id: string, category?: string): Promise<{ status: string }> =>
      apiFetch(`/universities/list/${id}`, {
        method: "POST",
        body: JSON.stringify({ category: category ?? null }),
      }),

    updateCategory: (id: string, category: string): Promise<{ status: string }> =>
      apiFetch(`/universities/list/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ category }),
      }),

    remove: (id: string): Promise<{ status: string }> =>
      apiFetch(`/universities/list/${id}`, { method: "DELETE" }),
  },

  profile: {
    get: (): Promise<Profile> => apiFetch("/profiles/me"),
    save: (data: Partial<Profile>): Promise<Profile> =>
      apiFetch("/profiles/me", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (data: Partial<Profile>): Promise<Profile> =>
      apiFetch("/profiles/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  activities: {
    list: (category?: string): Promise<Opportunity[]> =>
      apiFetch(`/activities${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  },

  deadlines: {
    list: (): Promise<Deadline[]> => apiFetch("/deadlines/"),
    create: (data: { title: string; due_date: string; category?: string }): Promise<Deadline> =>
      apiFetch("/deadlines/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Deadline>): Promise<Deadline> =>
      apiFetch(`/deadlines/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string): Promise<{ status: string }> =>
      apiFetch(`/deadlines/${id}`, { method: "DELETE" }),
  },
};
