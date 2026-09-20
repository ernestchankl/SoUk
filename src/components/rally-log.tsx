import type { Action, Match } from "@/lib/types";
import { formatCode } from "@/lib/volleyball";
import { playerById } from "@/lib/volleyball";
import { EVAL_META } from "@/lib/codes";
import { cn } from "@/lib/utils";

export function RallyLog({
  match,
  actions,
}: {
  match: Match;
  actions: Action[];
}) {
  if (actions.length === 0) {
    return (
      <p className="px-1 py-2 text-center text-sm font-medium text-muted-foreground">
        本球尚未記錄動作。先點球員，再選技術與評價。
      </p>
    );
  }

  const recent = [...actions].slice(-12).reverse();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {recent.map((action) => {
        const player = playerById(match, action.team, action.playerId);
        const meta = EVAL_META[action.evaluation];
        return (
          <div
            key={action.id}
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5"
          >
            <p className="font-mono text-sm font-bold tracking-wide">{formatCode(action)}</p>
            <p className="max-w-24 truncate text-xs font-medium text-muted-foreground">
              {player?.name || (action.playerNumber !== null ? `#${action.playerNumber}` : "未指定")}
            </p>
            <span className={cn("mt-0.5 inline-block rounded px-1.5 text-xs font-bold", meta.className)}>
              {action.evaluation}
            </span>
          </div>
        );
      })}
    </div>
  );
}
