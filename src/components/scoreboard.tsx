import { Badge } from "@/components/ui/badge";
import type { DerivedState, Match } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Scoreboard({
  match,
  state,
}: {
  match: Match;
  state: DerivedState;
}) {
  const setNo = state.currentSetIndex + 1;
  const homeServing = state.serving === "home";

  return (
    <section className="px-3 pt-3">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-white/2 p-3 shadow-inner">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          <span>第 {setNo} 局</span>
          <span>
            {match.bestOf === 5 ? "五局三勝" : "三局兩勝"} · {state.homeSets}-{state.awaySets}
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <TeamScore
            name={match.home.shortName || match.home.name}
            score={state.score.home}
            serving={homeServing}
            tone="home"
            align="left"
          />
          <div className="pb-1 text-center text-xl font-bold text-white/35">:</div>
          <TeamScore
            name={match.away.shortName || match.away.name}
            score={state.score.away}
            serving={!homeServing}
            tone="away"
            align="right"
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          {state.sets.map((set) => (
            <div
              key={set.index}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 font-mono text-sm font-bold",
                set.index === state.currentSetIndex
                  ? "bg-primary/20 text-primary"
                  : "bg-white/5 text-muted-foreground"
              )}
            >
              <span>{set.home}</span>
              <span className="opacity-40">-</span>
              <span>{set.away}</span>
            </div>
          ))}
        </div>
        {state.matchWinner ? (
          <div className="mt-3 rounded-lg bg-primary/15 px-3 py-2 text-center text-base font-bold text-primary">
            {(state.matchWinner === "home" ? match.home.name : match.away.name)} 獲勝
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TeamScore({
  name,
  score,
  serving,
  tone,
  align,
}: {
  name: string;
  score: number;
  serving: boolean;
  tone: "home" | "away";
  align: "left" | "right";
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <div className="flex items-center gap-1.5" style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        {serving && align === "left" ? <ServeDot tone={tone} /> : null}
        <p
          className={cn(
            "truncate text-base font-bold",
            tone === "home" ? "text-home" : "text-away"
          )}
        >
          {name}
        </p>
        {serving && align === "right" ? <ServeDot tone={tone} /> : null}
      </div>
      <p className="tabular-score mt-0.5 font-mono text-5xl font-black leading-none tracking-tight">
        {score}
      </p>
      {serving ? (
        <Badge className="mt-1.5 h-6 bg-white/10 px-2 text-xs font-semibold text-foreground" variant="secondary">
          發球
        </Badge>
      ) : (
        <span className="mt-1.5 inline-block h-6 text-xs text-transparent">發球</span>
      )}
    </div>
  );
}

function ServeDot({ tone }: { tone: "home" | "away" }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 rounded-full",
        tone === "home" ? "bg-home" : "bg-away"
      )}
    />
  );
}
