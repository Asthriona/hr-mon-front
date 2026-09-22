export interface Session {
  id: number;
  label: string;
  start_ts: string;
  end_ts: string;
  note: string;
}

export interface Stretch {
  start_ts: string;
  end_ts: string;
  count: number;
}

export interface Overall {
  count: number;
  duration_s: number;
  avg: number;
  min: number;
  max: number;
  median: number;
  p10: number;
  p90: number;
  stdev: number;
  top10_avg: number;
  peak_1min: number;
  rest_estimate: number;
  zones_sec: Record<string, number>;
  zones_pct: Record<string, number>;
}

export interface PerSession extends Session {
  count: number;
  duration_s: number;
  avg: number;
  min: number;
  max: number;
  peak_1min: number;
}

export type SeriesPoint = [string, number, number, number, number];

export interface StatsResponse {
  meta: {
    start: string | null;
    end: string | null;
    labels: string[];
    max_hr: number;
    bucket_s: number;
    data_points: number;
  };
  current_bpm: number | null;
  overall: Overall | null;
  per_session: PerSession[];
  series: SeriesPoint[];
  histogram: number[][];
  hist_min: number | null;
  hist_max: number | null;
  stretches: Stretch[];
  sessions: Session[];
}

export const ZONES = ["z1", "z2", "z3", "z4", "z5"] as const;
export type Zone = (typeof ZONES)[number];

export const LABELS = ["race", "practice", "work", "other"] as const;

export const ZONE_META: Record<Zone, { label: string; color: string; thresh: string }> = {
  z1: { label: "Z1 Recovery", color: "#9ecbff", thresh: "<60% maxHR" },
  z2: { label: "Z2 Endurance", color: "#3fb950", thresh: "60-70% maxHR" },
  z3: { label: "Z3 Tempo", color: "#e3b341", thresh: "70-80% maxHR" },
  z4: { label: "Z4 Threshold", color: "#f0883e", thresh: "80-90% maxHR" },
  z5: { label: "Z5 Max", color: "#ff6b6b", thresh: "90%+ maxHR" },
};

export const LABEL_META: Record<Label, { color: string }> = {
  race: { color: "#ff6b6b" },
  practice: { color: "#f0883e" },
  work: { color: "#3fb950" },
  other: { color: "#9ecbff" },
};

export type Label = (typeof LABELS)[number];