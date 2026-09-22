import type { SeriesPoint } from "../types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtTime } from "../format";

interface Props {
  series: SeriesPoint[];
  maxHr: number;
}

export default function HrLine({ series, maxHr }: Props) {
  const data = series.map(([ts, avg, min, max]) => ({
    t: new Date(ts).getTime(),
    avg,
    min,
    max,
  }));

  if (!data.length) return <div className="empty">no data</div>;

  const zoneLines = [0.6, 0.7, 0.8, 0.9].map((f) => Math.round(maxHr * f));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
        <CartesianGrid stroke="#1c2430" strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t: number) => fmtTime(t)}
          stroke="#8b98a9"
          tick={{ fontSize: 11, fill: "#8b98a9" }}
        />
        <YAxis domain={["auto", "auto"]} stroke="#8b98a9" tick={{ fontSize: 11, fill: "#8b98a9" }} />
        <Tooltip
          labelFormatter={(t: number) => new Date(t).toLocaleString()}
          formatter={(v: number, name: string) => [v, `bpm ${name}`]}
          contentStyle={{ background: "#11161d", border: "1px solid #1c2430", borderRadius: 8 }}
          labelStyle={{ color: "#e6edf3" }}
        />
        {zoneLines.map((y) => (
          <ReferenceLine key={y} y={y} stroke="#3a4657" strokeDasharray="4 4" />
        ))}
        <Line type="monotone" dataKey="avg" stroke="#3fb950" strokeWidth={2} dot={false} name="avg" isAnimationActive={false} />
        <Line type="monotone" dataKey="max" stroke="#5b3340" strokeWidth={1} dot={false} name="max" isAnimationActive={false} />
        <Line type="monotone" dataKey="min" stroke="#2c3a4f" strokeWidth={1} dot={false} name="min" isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}