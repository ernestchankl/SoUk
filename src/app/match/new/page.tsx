"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/codes-help";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { RosterEditor } from "@/components/roster-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uid } from "@/lib/id";
import {
  AWAY_ROSTER,
  HOME_ROSTER,
  createBlankTeam,
  createNamedTeam,
} from "@/lib/sample";
import { saveMatch } from "@/lib/storage";
import type { BestOf, Match, Team, TeamSide } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NewMatchPage() {
  const router = useRouter();
  const [home, setHome] = useState<Team>(() => createBlankTeam("我方", "我方"));
  const [away, setAway] = useState<Team>(() => createBlankTeam("對方", "對方"));
  const [bestOf, setBestOf] = useState<BestOf>(5);
  const [firstServe, setFirstServe] = useState<TeamSide>("home");

  const start = () => {
    const match: Match = {
      id: uid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      home,
      away,
      bestOf,
      firstServe,
      status: "live",
      actions: [],
    };
    saveMatch(match);
    router.push(`/match/${match.id}`);
  };

  return (
    <PhoneShell>
      <TopBar left={<BackLink href="/" />} title="新比賽" />
      <main className="flex-1 space-y-5 overflow-y-auto px-4 py-4 pb-28">
        <section className="space-y-2">
          <Label>賽制</Label>
          <div className="grid grid-cols-2 gap-2">
            <Choice active={bestOf === 5} onClick={() => setBestOf(5)} label="五局三勝" />
            <Choice active={bestOf === 3} onClick={() => setBestOf(3)} label="三局兩勝" />
          </div>
        </section>
        <section className="space-y-2">
          <Label>第一局先發發球</Label>
          <div className="grid grid-cols-2 gap-2">
            <Choice
              active={firstServe === "home"}
              onClick={() => setFirstServe("home")}
              label={home.shortName || "我方"}
            />
            <Choice
              active={firstServe === "away"}
              onClick={() => setFirstServe("away")}
              label={away.shortName || "對方"}
            />
          </div>
        </section>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHome(createNamedTeam("海大藍鯨", "藍鯨", HOME_ROSTER));
              setAway(createNamedTeam("北市紅隼", "紅隼", AWAY_ROSTER));
            }}
          >
            帶入示範名單
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setHome(createBlankTeam("我方", "我方"));
              setAway(createBlankTeam("對方", "對方"));
            }}
          >
            清空姓名
          </Button>
        </div>

        <Tabs defaultValue="home">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="home">我方名單</TabsTrigger>
            <TabsTrigger value="away">對方名單</TabsTrigger>
          </TabsList>
          <TabsContent value="home" className="mt-3">
            <RosterEditor team={home} onChange={setHome} tone="home" />
          </TabsContent>
          <TabsContent value="away" className="mt-3">
            <RosterEditor team={away} onChange={setAway} tone="away" />
          </TabsContent>
        </Tabs>
      </main>
      <div className="sticky bottom-0 border-t border-white/10 bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className={cn(buttonVariants(), "h-12 w-full text-base")}
          onClick={start}
        >
          開始記錄
        </button>
      </div>
    </PhoneShell>
  );
}

function Choice({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl border text-sm ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}
