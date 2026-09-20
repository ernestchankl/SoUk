"use client";

import { Suspense } from "react";
import { BackLink } from "@/components/codes-help";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { RosterEditor } from "@/components/roster-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatchId } from "@/hooks/use-match-id";
import { useMatch, useMatches } from "@/hooks/use-matches";
import { matchHref, withBase } from "@/lib/routes";
import { deriveState } from "@/lib/volleyball";

export default function SetupRoute() {
  return (
    <Suspense fallback={<PhoneShell><p className="p-6 text-sm text-muted-foreground">載入中…</p></PhoneShell>}>
      <SetupPage />
    </Suspense>
  );
}

function SetupPage() {
  const id = useMatchId();
  const { match, update } = useMatch(id);
  const { remove } = useMatches();

  if (!match) {
    return (
      <PhoneShell>
        <TopBar left={<BackLink href="/" />} title="比賽設定" />
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          找不到比賽。
        </p>
      </PhoneShell>
    );
  }

  const state = deriveState(match);

  return (
    <PhoneShell>
      <TopBar left={<BackLink href={matchHref(match.id)} />} title="名單與設定" />
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-10 space-y-5">
        <Tabs defaultValue="home">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="home">{match.home.shortName}</TabsTrigger>
            <TabsTrigger value="away">{match.away.shortName}</TabsTrigger>
          </TabsList>
          <TabsContent value="home" className="mt-3">
            <RosterEditor
              team={match.home}
              tone="home"
              onChange={(home) => update({ ...match, home })}
            />
          </TabsContent>
          <TabsContent value="away" className="mt-3">
            <RosterEditor
              team={match.away}
              tone="away"
              onChange={(away) => update({ ...match, away })}
            />
          </TabsContent>
        </Tabs>

        {state.matchWinner ? null : match.status === "completed" ? (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => update({ ...match, status: "live" })}
          >
            繼續記錄
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => update({ ...match, status: "completed" })}
          >
            提前結束比賽
          </Button>
        )}

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            if (window.confirm("確定刪除這場比賽？此動作無法復原。")) {
              remove(match.id);
              window.location.assign(withBase("/"));
            }
          }}
        >
          刪除比賽
        </Button>
      </main>
    </PhoneShell>
  );
}
