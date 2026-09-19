import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { deriveState } from "@/lib/volleyball";
import { ChevronRight } from "lucide-react";

export function MatchCard({ match }: { match: Match }) {
  const state = deriveState(match);
  const date = new Date(match.updatedAt);
  const live = !state.matchWinner && match.status === "live";

  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/8 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {date.toLocaleDateString("zh-TW", {
              month: "numeric",
              day: "numeric",
              weekday: "short",
            })}{" "}
            {date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <h2 className="mt-1 text-base font-medium">
            {match.home.name} <span className="text-muted-foreground">vs</span> {match.away.name}
          </h2>
        </div>
        {live ? (
          <Badge className="bg-emerald-500/20 text-emerald-300">進行中</Badge>
        ) : (
          <Badge variant="secondary">已結束</Badge>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="font-mono text-3xl font-black tabular-nums">
          {state.homeSets}
          <span className="mx-1 text-white/30">:</span>
          {state.awaySets}
        </p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          {state.sets.map((s) => `${s.home}-${s.away}`).join(" / ")}
          <ChevronRight className="size-4" />
        </p>
      </div>
    </Link>
  );
}
