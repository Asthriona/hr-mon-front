import type { Overall } from "../types";
import { ZONES, ZONE_META } from "../types";
import { fmtDur, round1 } from "../format";

interface Props {
  overall: Overall | null;
  currentBpm: number | null;
  dataPoints: number;
  sessionCount: number;
  loading: boolean;
}

function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  );
}

export default function StatCards({ overall, currentBpm, dataPoints, sessionCount, loading }: Props) {
  if (!overall) {
    return (
      <section className="cards">
        <div className="empty">{loading ? "loading stats…" : "no data in this range — pick another range or wait for a session"}</div>
      </section>
    );
  }

  const zoneMax = Math.max(...ZONES.map((z) => overall.zones_pct[z]), 1);

  return (
    <section className="cards">
      <div className="stat live">
        <div className="stat-label">current</div>
        <div className="stat-value big live" style={{ color: currentBpm ? "#3fb950" : "#8b98a9" }}>
          {currentBpm ?? "—"}
        </div>
        <div className="stat-sub">bpm now</div>
      </div>

      <Card label="avg" value={round1(overall.avg)} sub={`median ${round1(overall.median)}`} accent="#3fb950" />
      <Card label="max" value={String(overall.max)} sub={`peak 1min ${round1(overall.peak_1min)}`} accent="#ff6b6b" />
      <Card label="min" value={String(overall.min)} sub={`rest est ${round1(overall.rest_estimate)}`} />
      <Card label="stdev" value={round1(overall.stdev)} sub={`p10 ${overall.p10} · p90 ${overall.p90}`} />
      <Card label="top 10%" value={round1(overall.top10_avg)} sub="avg of hardest 10%" />
      <Card label="duration" value={fmtDur(overall.duration_s)} sub={`${dataPoints.toLocaleString()} samples`} />
      <Card label="sessions" value={String(sessionCount)} sub="labeled in range" />

      <div className="stat zones">
        <div className="stat-label">time in zones</div>
        <div className="zone-bars">
          {ZONES.map((z) => (
            <div
              key={z}
              className="zone-bar"
              style={{ width: `${(overall.zones_pct[z] / zoneMax) * 100}%`, background: ZONE_META[z].color }}
              title={`${ZONE_META[z].label}: ${fmtDur(overall.zones_sec[z])} (${overall.zones_pct[z]}%)`}
            >
              {z.toUpperCase().slice(1)}
            </div>
          ))}
        </div>
        <div className="stat-sub">
          {ZONES.map((z) => `${ZONE_META[z].label.replace("Z" + z[1] + " ", "")} ${overall.zones_pct[z]}%`).join(" · ")}
        </div>
      </div>
    </section>
  );
}