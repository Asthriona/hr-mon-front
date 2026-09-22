import type { Overall } from "../types";
import { ZONES, ZONE_META } from "../types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fmtDur, round1 } from "../format";

interface Props {
  overall: Overall | null;
  avg: number;
}

export default function ZonesDoughnut({ overall, avg }: Props) {
  if (!overall) return <div className="empty">no data</div>;

  const items = ZONES.map((z) => ({
    name: ZONE_META[z].label,
    color: ZONE_META[z].color,
    seconds: overall.zones_sec[z],
    pct: overall.zones_pct[z],
  }));

  return (
    <div className="doughnut">
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Tooltip
              formatter={(v: number, name: string) => [`${fmtDur(v)}`, name]}
              contentStyle={{ background: "#11161d", border: "1px solid #1c2430", borderRadius: 8 }}
              labelStyle={{ color: "#e6edf3" }}
            />
            <Pie
              data={items}
              dataKey="seconds"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={1}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
              stroke="none"
            >
              {items.map((it) => (
                <Cell key={it.name} fill={it.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="doughnut-center">
          <div className="doughnut-center-value">{round1(avg)}</div>
          <div className="doughnut-center-label">avg bpm</div>
        </div>
      </div>
      <div className="legend-list">
        {items.map((it) => (
          <div key={it.name} className="legend-row">
            <i style={{ background: it.color }} />
            <span className="lg-name">{it.name}</span>
            <span className="lg-time">{fmtDur(it.seconds)}</span>
            <span className="lg-pct">{it.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}