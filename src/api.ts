import type { StatsResponse } from "./types";

function resolveToken(): string {
  const q = new URLSearchParams(window.location.search);
  const t = q.get("token");
  if (t) {
    localStorage.setItem("hrToken", t);
    const u = new URL(window.location.href);
    u.searchParams.delete("token");
    window.history.replaceState({}, "", u.toString());
    return t;
  }
  const saved = localStorage.getItem("hrToken");
  if (saved) return saved;
  const injected = (window as unknown as { AUTH_TOKEN?: string }).AUTH_TOKEN;
  return injected || "";
}

const TOKEN = resolveToken();

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "X-Auth-Token": TOKEN };
  if (init?.body) headers["Content-Type"] = "application/json";
  const r = await fetch(path, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
  if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`);
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

export interface StatsParams {
  start?: string;
  end?: string;
  labels?: string[];
  maxHr: number;
  bucketS: number;
}

export function getStats(p: StatsParams): Promise<StatsResponse> {
  const q = new URLSearchParams();
  if (p.start) q.set("start", p.start);
  if (p.end) q.set("end", p.end);
  if (p.labels?.length) q.set("labels", p.labels.join(","));
  q.set("max_hr", String(p.maxHr));
  q.set("bucket_s", String(p.bucketS));
  q.set("gap_s", "150");
  return req<StatsResponse>(`/stats?${q}`);
}

export function createSession(
  label: string,
  startTs: string,
  endTs: string,
  note = ""
): Promise<{ id: number }> {
  return req("/sessions", {
    method: "POST",
    body: JSON.stringify({ label, start_ts: startTs, end_ts: endTs, note }),
  });
}

export function deleteSession(id: number): Promise<{ deleted: number }> {
  return req(`/sessions/${id}`, { method: "DELETE" });
}

export function latestBpm(): Promise<number> {
  return fetch("/bpm", { headers: { "X-Auth-Token": TOKEN } }).then((r) => r.text()).then((t) => parseInt(t, 10) || 0);
}