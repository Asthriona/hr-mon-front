import type { Label } from "../types";
import { LABELS, LABEL_META } from "../types";
import { fmtDateTimeLocal } from "../format";

export type QuickRange = "today" | "24h" | "7d" | "all";

interface Props {
  from: Date | null;
  to: Date | null;
  labels: "" | Label;
  maxHr: number;
  currentBpm: number | null;
  onFrom: (d: Date | null) => void;
  onTo: (d: Date | null) => void;
  onLabels: (l: "" | Label) => void;
  onMaxHr: (n: number) => void;
  onQuick: (q: QuickRange) => void;
  onRefresh: () => void;
  stale: boolean;
}

const QUICK: { key: QuickRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "24h", label: "24h" },
  { key: "7d", label: "Week" },
  { key: "all", label: "All" },
];

export default function RangeBar(p: Props) {
  return (
    <header className="rangebar">
      <div className="brand">
        <div className="brand-title">HR Monitor</div>
        <div className={"live-bpm" + (p.currentBpm ? " live" : "")}>
          {p.currentBpm ?? "--"}
          <span className="unit">bpm</span>
        </div>
      </div>

      <div className="controls">
        <div className="quick">
          {QUICK.map((q) => (
            <button
              key={q.key}
              className="pill"
              onClick={() => p.onQuick(q.key)}
            >
              {q.label}
            </button>
          ))}
        </div>

        <label className="field">
          <span>from</span>
          <input
            type="datetime-local"
            value={p.from ? fmtDateTimeLocal(p.from) : ""}
            onChange={(e) => p.onFrom(e.target.value ? new Date(e.target.value) : null)}
          />
        </label>
        <label className="field">
          <span>to</span>
          <input
            type="datetime-local"
            value={p.to ? fmtDateTimeLocal(p.to) : ""}
            onChange={(e) => p.onTo(e.target.value ? new Date(e.target.value) : null)}
          />
        </label>

        <label className="field">
          <span>activity</span>
          <select
            value={p.labels}
            onChange={(e) => p.onLabels(e.target.value as "" | Label)}
          >
            <option value="">any</option>
            {LABELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label className="field small">
          <span>max HR</span>
          <input
            type="number"
            min={80}
            max={250}
            value={p.maxHr}
            onChange={(e) => p.onMaxHr(Number(e.target.value) || 190)}
          />
        </label>

        <button className="pill accent" onClick={p.onRefresh} disabled={p.stale}>
          {p.stale ? "loading…" : "refresh"}
        </button>
      </div>

      <div className="legend">
        {LABELS.map((l) => (
          <span key={l} className="legend-chip">
            <i style={{ background: LABEL_META[l].color }} />
            {l}
          </span>
        ))}
      </div>
    </header>
  );
}