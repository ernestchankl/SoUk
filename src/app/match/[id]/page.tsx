"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { CodingPad } from "@/components/coding-pad";
import { BackLink, CodesHelp } from "@/components/codes-help";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { RallyLog } from "@/components/rally-log";
import { Scoreboard } from "@/components/scoreboard";
import { Button } from "@/components/ui/button";
import { useMatch } from "@/hooks/use-matches";
import { uid } from "@/lib/id";
import type { Action, Evaluation, Player, Skill, TeamSide } from "@/lib/types";
import { deriveState, isTerminal } from "@/lib/volleyball";
import { BarChart3, Undo2 } from "lucide-react";

export default function ScoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { match, update } = useMatch(params.id);

  const state = useMemo(() => (match ? deriveState(match) : null), [match]);

  if (!match || !state) {
    return (
      <PhoneShell>
        <TopBar left={<BackLink href="/" />} title="比賽" />
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          找不到這場比賽，或資料還在載入。請回列表再試一次。
        </p>
      </PhoneShell>
    );
  }

  const locked = Boolean(state.matchWinner) || match.status === "completed";

  const commitAction = (action: Omit<Action, "id" | "at">) => {
    if (locked) return;
    const next: Action = { ...action, id: uid(), at: Date.now() };
    const actions = [...match.actions, next];
    const draft = { ...match, actions };
    const derived = deriveState(draft);
    update({
      ...draft,
      status: derived.matchWinner ? "completed" : "live",
    });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(isTerminal(action.skill, action.evaluation) ? 18 : 8);
    }
  };

  const undo = () => {
    if (match.actions.length === 0) return;
    const actions = match.actions.slice(0, -1);
    const draft = { ...match, actions, status: "live" as const };
    update(draft);
  };

  const onCommit = ({
    team,
    player,
    skill,
    evaluation,
  }: {
    team: TeamSide;
    player: Player | null;
    skill: Skill;
    evaluation: Evaluation;
  }) => {
    commitAction({
      team,
      playerId: player?.id ?? null,
      playerNumber: player?.number ?? null,
      skill,
      evaluation,
    });
  };

  return (
    <PhoneShell>
      <TopBar
        left={<BackLink href="/" />}
        title={`${match.home.shortName} vs ${match.away.shortName}`}
        right={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            nativeButton={false}
            render={<Link href={`/match/${match.id}/stats`} />}
          >
            <BarChart3 />
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <Scoreboard match={match} state={state} />
        <div className="flex items-center justify-between px-4 py-2">
          <CodesHelp />
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/match/${match.id}/setup`} />}
            >
              名單
            </Button>
            <Button variant="ghost" size="sm" onClick={undo} disabled={match.actions.length === 0}>
              <Undo2 data-icon="inline-start" />
              撤銷
            </Button>
          </div>
        </div>
        <div className="px-3 pb-2">
          <p className="mb-1 text-[11px] tracking-widest text-muted-foreground uppercase">
            {state.rally.length ? "本球動作" : "最近動作"}
          </p>
          <RallyLog
            match={match}
            actions={state.rally.length ? state.rally : match.actions.slice(-8)}
          />
        </div>
        {locked ? (
          <div className="px-4 py-4">
            <Button className="h-12 w-full" nativeButton={false} render={<Link href={`/match/${match.id}/stats`} />}>
              查看本場分析
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => router.push("/")}
            >
              返回列表
            </Button>
          </div>
        ) : null}
      </div>
      <CodingPad
        match={match}
        disabled={locked}
        onCommit={onCommit}
        onQuickPoint={(team) =>
          commitAction({
            team,
            playerId: null,
            playerNumber: null,
            skill: "Q",
            evaluation: "#",
          })
        }
      />
    </PhoneShell>
  );
}
