"use client";

import Link from "next/link";
import { Suspense } from "react";
import { BackLink } from "@/components/codes-help";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { StatsView } from "@/components/stats-view";
import { Button } from "@/components/ui/button";
import { useMatchId } from "@/hooks/use-match-id";
import { useMatch } from "@/hooks/use-matches";
import { matchHref } from "@/lib/routes";
import { deriveState } from "@/lib/volleyball";
import { FileText } from "lucide-react";

export default function StatsRoute() {
  return (
    <Suspense fallback={<PhoneShell><p className="p-6 text-sm text-muted-foreground">載入數據中…</p></PhoneShell>}>
      <StatsPage />
    </Suspense>
  );
}

function StatsPage() {
  const id = useMatchId();
  const { match } = useMatch(id);

  if (!match) {
    return (
      <PhoneShell>
        <TopBar left={<BackLink href="/" />} title="找不到比賽" />
      </PhoneShell>
    );
  }

  const state = deriveState(match);

  return (
    <PhoneShell>
      <TopBar
        left={<BackLink href={matchHref(match.id)} />}
        title="比賽分析"
        right={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            nativeButton={false}
            render={<Link href={matchHref(match.id, "report")} />}
          >
            <FileText />
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 text-sm text-muted-foreground">
          {match.home.name} {state.homeSets}-{state.awaySets} {match.away.name}
          {state.matchWinner ? " · 完場" : " · 進行中"}
        </p>
        <StatsView match={match} />
        <Button
          className="mb-3 h-12 w-full font-bold"
          nativeButton={false}
          render={<Link href={matchHref(match.id, "report")} />}
        >
          <FileText data-icon="inline-start" />
          開啟 A4 報告
        </Button>
        <Button
          variant="outline"
          className="mb-6 w-full"
          nativeButton={false}
          render={<Link href={matchHref(match.id)} />}
        >
          回到記錄台
        </Button>
      </main>
    </PhoneShell>
  );
}
