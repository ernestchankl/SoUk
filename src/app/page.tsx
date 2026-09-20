"use client";

import Link from "next/link";
import { useRef } from "react";
import { MatchCard } from "@/components/match-card";
import { PhoneShell } from "@/components/phone-shell";
import { Button } from "@/components/ui/button";
import { useMatches } from "@/hooks/use-matches";
import { createSampleMatch } from "@/lib/sample";
import { importMatchJson } from "@/lib/storage";
import { BarChart3, Plus, Upload } from "lucide-react";

export default function HomePage() {
  const { matches, save } = useMatches();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <PhoneShell>
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        <p className="text-[11px] tracking-[0.2em] text-primary">蘇屋排球隊</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Stat App</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          手機版排球比賽記錄。用 Data Volley 簡化代碼記每一球，賽後立刻看攻擊效率、接發與 Side-out。
        </p>
      </header>

      <div className="flex gap-2 px-5 py-3">
        <Button className="h-11 flex-1" nativeButton={false} render={<Link href="/match/new" />}>
          <Plus data-icon="inline-start" />
          新比賽
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={() => fileRef.current?.click()}
        >
          <Upload />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              const raw = await file.text();
              save(importMatchJson(raw));
            } catch {
              window.alert("無法匯入這個檔案。");
            }
          }}
        />
      </div>

      <main className="flex-1 space-y-3 px-5 pb-8">
        {matches.length === 0 ? (
          <EmptyState
            onDemo={() => {
              try {
                save(createSampleMatch());
              } catch (error) {
                console.error(error);
                window.alert("無法載入示範場次，請再試一次。");
              }
            }}
          />
        ) : (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </main>
    </PhoneShell>
  );
}

function EmptyState({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-5 py-10 text-center">
      <BarChart3 className="mx-auto mb-3 size-8 text-primary" />
      <h2 className="text-lg font-medium">還沒有比賽</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        建立一場新比賽，或載入示範場次看看分析畫面。
      </p>
      <Button variant="secondary" className="mt-4" onClick={onDemo}>
        載入示範場次
      </Button>
    </div>
  );
}
