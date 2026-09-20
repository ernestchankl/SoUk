"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EVAL_META, EVALUATIONS, SKILLS, evalHint, padNumber, positionLabel } from "@/lib/codes";
import type { Evaluation, Match, Player, Skill, TeamSide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isTerminal } from "@/lib/volleyball";

export function CodingPad({
  match,
  disabled,
  onCommit,
  onQuickPoint,
}: {
  match: Match;
  disabled?: boolean;
  onCommit: (input: {
    team: TeamSide;
    player: Player | null;
    skill: Skill;
    evaluation: Evaluation;
  }) => void;
  onQuickPoint: (team: TeamSide) => void;
}) {
  const [team, setTeam] = useState<TeamSide>("home");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);

  const roster = team === "home" ? match.home.players : match.away.players;
  const player = useMemo(
    () => roster.find((p) => p.id === playerId) ?? null,
    [roster, playerId]
  );

  const commit = (evaluation: Evaluation) => {
    if (disabled || !skill) return;
    onCommit({ team, player, skill, evaluation });
    setSkill(null);
  };

  return (
    <div className="border-t border-white/10 bg-[#0d1f18] px-3 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
      <div className="mb-2 grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1">
        <SideToggle
          active={team === "home"}
          label={match.home.shortName || match.home.name}
          tone="home"
          onClick={() => {
            setTeam("home");
            setPlayerId(null);
          }}
        />
        <SideToggle
          active={team === "away"}
          label={match.away.shortName || match.away.name}
          tone="away"
          onClick={() => {
            setTeam("away");
            setPlayerId(null);
          }}
        />
      </div>

      <p className="mb-2 font-mono text-base font-bold tracking-wide text-foreground">
        {draftText(team, player, skill)}
      </p>

      <div className="grid grid-cols-4 gap-1.5">
        {roster.map((p) => {
          const selected = p.id === playerId;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => setPlayerId(p.id)}
              className={cn(
                "min-h-14 rounded-xl border px-1 py-1.5 text-left transition active:scale-[0.98] disabled:opacity-40",
                selected
                  ? team === "home"
                    ? "border-home bg-home text-background"
                    : "border-away bg-away text-background"
                  : "border-white/10 bg-white/5"
              )}
            >
              <span className="block font-mono text-xl font-black leading-none">
                {padNumber(p.number)}
              </span>
              <span className="mt-1 block truncate text-xs font-semibold leading-tight">
                {p.name || positionLabel(p.position)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {SKILLS.map((s) => {
          const selected = skill === s.code;
          return (
            <button
              key={s.code}
              type="button"
              disabled={disabled}
              onClick={() => setSkill(s.code)}
              className={cn(
                "min-h-14 rounded-xl border px-1 py-1.5 text-center transition active:scale-[0.98] disabled:opacity-40",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/10 bg-white/5"
              )}
            >
              <span className="block text-sm font-bold leading-tight">{s.label}</span>
              <span className="mt-0.5 block font-mono text-xs font-bold opacity-80">{s.code}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {EVALUATIONS.map((evaluation) => {
          const meta = EVAL_META[evaluation];
          const ready = Boolean(skill) && !disabled;
          const ends = skill ? isTerminal(skill, evaluation) : false;
          return (
            <button
              key={evaluation}
              type="button"
              disabled={!ready}
              onClick={() => commit(evaluation)}
              className={cn(
                "min-h-16 rounded-xl border px-0.5 py-1 text-center transition active:scale-[0.98] disabled:opacity-35",
                meta.className,
                ends && "ring-2 ring-white/40"
              )}
            >
              <span className="block font-mono text-2xl font-black leading-none">
                {evaluation}
              </span>
              <span className="mt-1 block text-[11px] font-semibold leading-tight">
                {skill ? evalHint(skill, evaluation) : meta.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          className="h-12 text-base font-bold bg-home/20 text-home hover:bg-home/30"
          onClick={() => onQuickPoint("home")}
        >
          {match.home.shortName} +1
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          className="h-12 text-base font-bold bg-away/20 text-away hover:bg-away/30"
          onClick={() => onQuickPoint("away")}
        >
          {match.away.shortName} +1
        </Button>
      </div>
    </div>
  );
}

function SideToggle({
  active,
  label,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  tone: "home" | "away";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-lg text-base font-bold transition",
        active
          ? tone === "home"
            ? "bg-home text-background"
            : "bg-away text-background"
          : "text-muted-foreground"
      )}
    >
      {label}
    </button>
  );
}

function draftText(team: TeamSide, player: Player | null, skill: Skill | null) {
  const prefix = team === "home" ? "*" : "a";
  const num = player ? padNumber(player.number) : "__";
  const s = skill ?? "_";
  return `${prefix}${num}${s}_`;
}
