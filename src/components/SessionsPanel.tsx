import type { Label, PerSession } from "../types";
import { LABELS, LABEL_META } from "../types";
import { fmtClock, fmtDur, round1 } from "../format";

interface Props {
  perSession: PerSession[];
  onDelete: (id: number) => void;
  busy: boolean;
}

interface Tot {
  label: string;
  count: number;
  dur: number;
  avgW: number;
  max: number;
}

export default function SessionsPanel({ perSession, onDelete, busy }: Props) {
  const totals: Tot[] = LABELS.map((l) => {
    const rows = perSession.filter((s) => s.label === l);
    const dur = rows.reduce((a, s) => a + s.duration_s, 0);
    const avgW = dur ? rows.reduce((a, s) => a + s.duration_s * s.avg, 0) / dur : 0;
    return {
      label: l,
      count: rows.length,
      dur,
      avgW,
      max: rows.reduce((a, s) => Math.max(a, s.max), 0),
    };
  }).filter((t) => t.count > 0);

  return (
    <div>
      {totals.length > 0 && (
        <div className="totals">
          {totals.map((t) => (
            <div key={t.label} className="total" style={{ borderColor: LABEL_META[t.label as keyof typeof LABEL_META].color }}>
              <span className="total-label">{t.label}</span>
              <span>{t.count} session{t.count > 1 ? "s" : ""}</span>
              <span>{fmtDur(t.dur)}</span>
              <span>avg {round1(t.avgW)}</span>
              <span>max {t.max}</span>
            </div>
          ))}
        </div>
      )}

      {perSession.length === 0 ? (
        <div className="empty">no labeled sessions in this range</div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>label</th>
              <th>from</th>
              <th>to</th>
              <th>dur</th>
              <th>samples</th>
              <th>avg</th>
              <th>max</th>
              <th>peak 1m</th>
              <th>note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {perSession.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="chip" style={{ color: LABEL_META[s.label as Label].color, borderColor: LABEL_META[s.label as Label].color }}>
                    {s.label}
                  </span>
                </td>
                <td>{fmtClock(s.start_ts)}</td>
                <td>{fmtClock(s.end_ts)}</td>
                <td>{fmtDur(s.duration_s)}</td>
                <td>{s.count}</td>
                <td>{round1(s.avg)}</td>
                <td>{s.max}</td>
                <td>{round1(s.peak_1min)}</td>
                <td className="dim">{s.note || "—"}</td>
                <td>
                  <button className="btn-danger" disabled={busy} onClick={() => onDelete(s.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}