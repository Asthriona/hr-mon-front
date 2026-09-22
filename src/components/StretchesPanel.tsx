import type { Label, Stretch } from "../types";
import { LABELS, LABEL_META } from "../types";
import { fmtClock, fmtDur } from "../format";

interface Props {
  stretches: Stretch[];
  onCreate: (label: Label, s: string, e: string) => void;
}

export default function StretchesPanel({ stretches, onCreate }: Props) {
  if (stretches.length === 0) return <div className="empty">no activity blocks detected in this range</div>;

  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>from</th>
          <th>to</th>
          <th>dur</th>
          <th>samples</th>
          <th>label as</th>
        </tr>
      </thead>
      <tbody>
        {stretches.map((s, i) => (
          <tr key={i}>
            <td>{fmtClock(s.start_ts)}</td>
            <td>{fmtClock(s.end_ts)}</td>
            <td>{fmtDur((new Date(s.end_ts).getTime() - new Date(s.start_ts).getTime()) / 1000)}</td>
            <td>{s.count}</td>
            <td>
              <div className="row">
                {LABELS.map((l) => (
                  <button
                    key={l}
                    className="label-btn"
                    style={{ color: LABEL_META[l].color, borderColor: LABEL_META[l].color }}
                    onClick={() => onCreate(l, s.start_ts, s.end_ts)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}