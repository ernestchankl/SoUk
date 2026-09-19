"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { POSITIONS, positionLabel } from "@/lib/codes";
import { uid } from "@/lib/id";
import type { Player, Position, Team } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export function RosterEditor({
  team,
  onChange,
  tone,
}: {
  team: Team;
  onChange: (team: Team) => void;
  tone: "home" | "away";
}) {
  const updatePlayer = (id: string, patch: Partial<Player>) => {
    onChange({
      ...team,
      players: team.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>隊名</Label>
          <Input
            value={team.name}
            onChange={(e) => onChange({ ...team, name: e.target.value })}
            className="h-10"
            placeholder={tone === "home" ? "我方隊名" : "對方隊名"}
          />
        </div>
        <div className="space-y-1">
          <Label>簡稱</Label>
          <Input
            value={team.shortName}
            onChange={(e) => onChange({ ...team, shortName: e.target.value })}
            className="h-10"
            placeholder="記分板顯示"
          />
        </div>
      </div>

      <div className="space-y-2">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="grid grid-cols-[4.2rem_1fr_auto] items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 p-2"
          >
            <Input
              inputMode="numeric"
              value={player.number}
              onChange={(e) =>
                updatePlayer(player.id, {
                  number: Number.parseInt(e.target.value || "0", 10) || 0,
                })
              }
              className="h-10 font-mono text-center"
            />
            <div className="min-w-0 space-y-1">
              <Input
                value={player.name}
                onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                className="h-9"
                placeholder="姓名"
              />
              <div className="flex flex-wrap gap-1">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.code}
                    type="button"
                    onClick={() => updatePlayer(player.id, { position: pos.code })}
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      player.position === pos.code
                        ? tone === "home"
                          ? "bg-home text-background"
                          : "bg-away text-background"
                        : "bg-white/8 text-muted-foreground"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() =>
                onChange({
                  ...team,
                  players: team.players.filter((p) => p.id !== player.id),
                })
              }
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() =>
          onChange({
            ...team,
            players: [
              ...team.players,
              {
                id: uid(),
                number: nextNumber(team.players),
                name: "",
                position: "U" as Position,
              },
            ],
          })
        }
      >
        <Plus data-icon="inline-start" />
        新增球員
      </Button>
      {team.players.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          至少加入一位球員才能開始記錄。目前預設位置為{positionLabel("U")}。
        </p>
      ) : null}
    </div>
  );
}

function nextNumber(players: Player[]): number {
  const used = new Set(players.map((p) => p.number));
  for (let n = 1; n <= 99; n += 1) {
    if (!used.has(n)) return n;
  }
  return players.length + 1;
}
