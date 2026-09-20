"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVAL_META, EVALUATIONS, positionLabel } from "@/lib/codes";
import type { EvalCounts, Match, PlayerSkillStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  attackEfficiency,
  computeTeamStats,
  deriveState,
  formatEff,
  formatPct,
  qualityEfficiency,
} from "@/lib/volleyball";

export function StatsView({ match }: { match: Match }) {
  const state = deriveState(match);
  const home = useMemo(() => computeTeamStats(match, "home"), [match]);
  const away = useMemo(() => computeTeamStats(match, "away"), [match]);
  const [side, setSide] = useState<"home" | "away">("home");
  const stats = side === "home" ? home : away;

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {state.sets.map((set) => (
          <div key={set.index} className="rounded-xl bg-white/5 px-2 py-2">
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
              SET {set.index + 1}
            </p>
            <p className="font-mono text-lg font-bold">
              {set.home}-{set.away}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SummaryCard
          name={home.name}
          tone="home"
          attack={home.attackEfficiency}
          reception={home.receptionEfficiency}
          set={home.setEfficiency}
          sideout={home.sideoutPct}
          aces={home.aces}
          kills={home.kills}
        />
        <SummaryCard
          name={away.name}
          tone="away"
          attack={away.attackEfficiency}
          reception={away.receptionEfficiency}
          set={away.setEfficiency}
          sideout={away.sideoutPct}
          aces={away.aces}
          kills={away.kills}
        />
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1">
        <button
          type="button"
          className={cn(
            "h-9 rounded-lg text-sm",
            side === "home" ? "bg-home text-background" : "text-muted-foreground"
          )}
          onClick={() => setSide("home")}
        >
          {match.home.shortName}
        </button>
        <button
          type="button"
          className={cn(
            "h-9 rounded-lg text-sm",
            side === "away" ? "bg-away text-background" : "text-muted-foreground"
          )}
          onClick={() => setSide("away")}
        >
          {match.away.shortName}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="攻擊效率" value={formatEff(stats.attackEfficiency)} hint="(扣死-失誤-被攔)/總數" />
        <StatTile label="接發效率" value={formatPct(stats.receptionEfficiency)} hint="# 1.0 / + 0.8 / ! 0.5" />
        <StatTile label="舉球效率" value={formatPct(stats.setEfficiency)} hint="# 最佳 / + 好球 / = 失誤" />
        <StatTile label="Side-out" value={formatPct(stats.sideoutPct)} hint={`${stats.sideouts}/${stats.receiveAttempts}`} />
        <StatTile label="Break point" value={formatPct(stats.breakPct)} hint={`${stats.breaks}/${stats.serveAttempts}`} />
        <StatTile label="完美舉球" value={String(stats.set["#"])} hint={`失誤 ${stats.set["="]} · 共 ${stats.set.total} 次`} />
      </div>

      <Tabs defaultValue="attack">
        <TabsList className="grid h-11 w-full grid-cols-5 bg-white/8">
          <TabsTrigger value="attack" className="px-1 text-xs sm:text-sm">攻擊</TabsTrigger>
          <TabsTrigger value="serve" className="px-1 text-xs sm:text-sm">發球</TabsTrigger>
          <TabsTrigger value="reception" className="px-1 text-xs sm:text-sm">接發</TabsTrigger>
          <TabsTrigger value="set" className="px-1 text-xs sm:text-sm">舉球</TabsTrigger>
          <TabsTrigger value="block" className="px-1 text-xs sm:text-sm">攔網</TabsTrigger>
        </TabsList>
        <TabsContent value="attack" className="mt-3 space-y-3">
          <EvalBar counts={stats.attack} />
          <PlayerTable
            players={stats.players}
            field="attack"
            extra={(p) => formatEff(attackEfficiency(p.attack))}
            extraLabel="效率"
          />
        </TabsContent>
        <TabsContent value="serve" className="mt-3 space-y-3">
          <EvalBar counts={stats.serve} />
          <PlayerTable
            players={stats.players}
            field="serve"
            extra={(p) => `${p.serve["#"]}/${p.serve["="]}`}
            extraLabel="ACE/失"
          />
        </TabsContent>
        <TabsContent value="reception" className="mt-3 space-y-3">
          <EvalBar counts={stats.reception} />
          <PlayerTable
            players={stats.players}
            field="reception"
            extra={(p) => formatPct(qualityEfficiency(p.reception))}
            extraLabel="效率"
          />
        </TabsContent>
        <TabsContent value="set" className="mt-3 space-y-3">
          <EvalBar counts={stats.set} />
          <PlayerTable
            players={stats.players}
            field="set"
            extra={(p) => formatPct(qualityEfficiency(p.set))}
            extraLabel="效率"
          />
        </TabsContent>
        <TabsContent value="block" className="mt-3 space-y-3">
          <EvalBar counts={stats.block} />
          <PlayerTable
            players={stats.players}
            field="block"
            extra={(p) => String(p.block["#"])}
            extraLabel="攔死"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({
  name,
  tone,
  attack,
  reception,
  set,
  sideout,
  aces,
  kills,
}: {
  name: string;
  tone: "home" | "away";
  attack: number | null;
  reception: number | null;
  set: number | null;
  sideout: number | null;
  aces: number;
  kills: number;
}) {
  return (
    <Card className="bg-white/5 ring-white/10">
      <CardHeader className="pb-1">
        <CardTitle className={cn("text-sm", tone === "home" ? "text-home" : "text-away")}>
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        <p>攻擊 {formatEff(attack)} · 接發 {formatPct(reception)}</p>
        <p>舉球 {formatPct(set)} · Side-out {formatPct(sideout)}</p>
        <p>
          扣死 {kills} · ACE {aces}
        </p>
      </CardContent>
    </Card>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground/80">{hint}</p>
    </div>
  );
}

function EvalBar({ counts }: { counts: EvalCounts }) {
  if (counts.total === 0) {
    return (
      <p className="rounded-xl bg-white/4 px-3 py-6 text-center text-sm text-muted-foreground">
        這個技術還沒有記錄。
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex h-4 overflow-hidden rounded-full">
        {EVALUATIONS.map((ev) => {
          const n = counts[ev];
          if (!n) return null;
          return (
            <div
              key={ev}
              className={cn("h-full", barColor(ev))}
              style={{ width: `${(n / counts.total) * 100}%` }}
              title={`${ev} ${n}`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-6 gap-1 text-center font-mono text-[11px]">
        {EVALUATIONS.map((ev) => (
          <div key={ev}>
            <span className={cn("inline-block rounded px-1", EVAL_META[ev].className)}>{ev}</span>
            <p className="mt-0.5">{counts[ev]}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] text-muted-foreground">共 {counts.total} 次</p>
    </div>
  );
}

function PlayerTable({
  players,
  field,
  extra,
  extraLabel,
}: {
  players: PlayerSkillStats[];
  field: "attack" | "serve" | "reception" | "block" | "set";
  extra: (p: PlayerSkillStats) => string;
  extraLabel: string;
}) {
  const rows = players.filter((p) => p[field].total > 0);
  if (rows.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">沒有球員數據。</p>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <table className="w-full text-left text-xs">
        <thead className="bg-white/6 text-muted-foreground">
          <tr>
            <th className="px-2 py-2 font-medium">球員</th>
            <th className="px-1 py-2 font-medium">#</th>
            <th className="px-1 py-2 font-medium">+</th>
            <th className="px-1 py-2 font-medium">=</th>
            <th className="px-2 py-2 font-medium">{extraLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={`${p.playerId}-${p.number}`} className="border-t border-white/6">
              <td className="px-2 py-2">
                <span className="font-mono font-bold">{p.number ?? "—"}</span>{" "}
                <span>{p.name}</span>
                {p.position ? (
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    {positionLabel(p.position)}
                  </span>
                ) : null}
              </td>
              <td className="px-1 py-2 font-mono">{p[field]["#"]}</td>
              <td className="px-1 py-2 font-mono">{p[field]["+"]}</td>
              <td className="px-1 py-2 font-mono">{p[field]["="]}</td>
              <td className="px-2 py-2 font-mono">{extra(p)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function barColor(ev: keyof typeof EVAL_META): string {
  switch (ev) {
    case "#":
      return "bg-emerald-500";
    case "+":
      return "bg-lime-400";
    case "!":
      return "bg-amber-300";
    case "-":
      return "bg-orange-400";
    case "/":
      return "bg-rose-400";
    case "=":
      return "bg-red-600";
  }
}
