import { ZONE_META } from "../types";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  histogram: number[][];
  maxHr: number;
}

function zoneColorFor(bpm: number, maxHr: number): string {
  const pct = (bpm / maxHr) * 100;
  if (pct >= 90) return ZONE_META.z5.color;
  if (pct >= 80) return ZONE_META.z4.color;
  if (pct >= 70) return ZONE_META.z3.color;
  if (pct >= 60) return ZONE_META.z2.color;
  return ZONE_META.z1.color;
}

export default function HistogramChart({ histogram, maxHr }: Props) {
  if (!histogram.length) return <div className="empty">no data</div>;

  const data = histogram.map(([lo, hi, v]) => ({
    bucket: `${lo}-${hi}`,
    v,
    color: zoneColorFor((lo + hi) / 2, maxHr),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
        <CartesianGrid stroke="#1c2430" strokeDasharray="3 3" />
        <XAxis dataKey="bucket" stroke="#8b98a9" tick={{ fontSize: 10, fill: "#8b98a9" }} />
        <YAxis stroke="#8b98a9" tick={{ fontSize: 11, fill: "#8b98a9" }} />
        <Tooltip
          formatter={(v: number, _n: string) => [`${v} bpm-samples`, "bucket"]}
          contentStyle={{ background: "#11161d", border: "1px solid #1c2430", borderRadius: 8 }}
          labelStyle={{ color: "#e6edf3" }}
        />
        <Bar dataKey="v" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.bucket} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}