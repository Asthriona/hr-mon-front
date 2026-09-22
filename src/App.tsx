import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSession, deleteSession, getStats, latestBpm } from "./api";
import type { Label } from "./types";
import RangeBar, { type QuickRange } from "./components/RangeBar";
import StatCards from "./components/StatCards";
import HrLine from "./components/HrLine";
import ZonesDoughnut from "./components/ZonesDoughnut";
import HistogramChart from "./components/HistogramChart";
import SessionsPanel from "./components/SessionsPanel";
import StretchesPanel from "./components/StretchesPanel";

function bucketFor(from: Date | null, to: Date | null): number {
  if (!from || !to) return 600;
  const span = to.getTime() - from.getTime();
  if (span <= 4 * 3600e3) return 15;
  if (span <= 24 * 3600e3) return 60;
  return 600;
}

export default function App() {
  const [from, setFrom] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [to, setTo] = useState<Date | null>(new Date());
  const [labels, setLabels] = useState<"" | Label>("");
  const [maxHr, setMaxHr] = useState<number>(() => Number(localStorage.getItem("hrMaxHr") || 190));
  const [liveBpm, setLiveBpm] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const bucketS = useMemo(() => bucketFor(from, to), [from, to]);

  useEffect(() => {
    const tick = () => {
      setTo((prev) => (prev && Date.now() - prev.getTime() < 5 * 60e3 ? new Date() : prev));
      latestBpm().then(setLiveBpm).catch(() => {});
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const q = useQuery({
    queryKey: ["stats", from?.toISOString(), to?.toISOString(), labels, maxHr, bucketS],
    queryFn: () =>
      getStats({
        start: from ? from.toISOString() : undefined,
        end: to ? to.toISOString() : undefined,
        labels: labels ? [labels] : [],
        maxHr,
        bucketS,
      }),
    placeholderData: keepPreviousData,
  });

  const data = q.data;
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["stats"] });

  const createMut = useMutation({
    mutationFn: (v: { label: Label; s: string; e: string }) => createSession(v.label, v.s, v.e),
    onSuccess: () => {
      setFlash(null);
      invalidate();
    },
    onError: (e) => setFlash(`labeling failed: ${String(e)}`),
  });
  const delMut = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      setFlash(null);
      invalidate();
    },
    onError: (e) => setFlash(`delete failed: ${String(e)}`),
  });

  const setMaxHrAndSave = (n: number) => {
    setMaxHr(n);
    localStorage.setItem("hrMaxHr", String(n));
  };

  const quick = (range: QuickRange) => {
    const now = new Date();
    if (range === "today") {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      setFrom(d);
      setTo(now);
    } else if (range === "24h") {
      setFrom(new Date(now.getTime() - 24 * 3600e3));
      setTo(now);
    } else if (range === "7d") {
      setFrom(new Date(now.getTime() - 7 * 86400e3));
      setTo(now);
    } else {
      setFrom(null);
      setTo(null);
    }
  };

  return (
    <div className="app">
      <RangeBar
        from={from}
        to={to}
        labels={labels}
        maxHr={maxHr}
        currentBpm={liveBpm ?? data?.current_bpm ?? null}
        onFrom={setFrom}
        onTo={setTo}
        onLabels={setLabels}
        onMaxHr={setMaxHrAndSave}
        onQuick={quick}
        onRefresh={() => q.refetch()}
        stale={q.isFetching}
      />

      {q.isError && !data && <div className="banner error">api error: {String(q.error)}</div>}
      {flash && (
        <div className="banner error">
          {flash} <button className="dismiss" onClick={() => setFlash(null)}>✕</button>
        </div>
      )}

      <StatCards
        overall={data?.overall ?? null}
        currentBpm={liveBpm ?? data?.current_bpm ?? null}
        dataPoints={data?.meta.data_points ?? 0}
        sessionCount={data?.per_session.length ?? 0}
        loading={q.isPending}
      />

      <section className="grid charts">
        <div className="card span2">
          <h2>Heart rate over time</h2>
          <HrLine series={data?.series ?? []} maxHr={maxHr} />
        </div>
        <div className="card">
          <h2>Time in zones</h2>
          <ZonesDoughnut overall={data?.overall ?? null} avg={data?.overall?.avg ?? 0} />
        </div>
        <div className="card">
          <h2>BPM distribution</h2>
          <HistogramChart histogram={data?.histogram ?? []} maxHr={maxHr} />
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h2>Labeled sessions</h2>
          <SessionsPanel perSession={data?.per_session ?? []} onDelete={(id) => delMut.mutate(id)} busy={delMut.isPending} />
        </div>
        <div className="card">
          <h2>Detected activity blocks</h2>
          <p className="hint">Continuous stretches of data. Click a label to tag the whole block — a session is born.</p>
          <StretchesPanel stretches={data?.stretches ?? []} onCreate={(l, s, e) => createMut.mutate({ label: l, s, e })} />
        </div>
      </section>
    </div>
  );
}