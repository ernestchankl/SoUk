"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { BackLink } from "@/components/codes-help";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { Button } from "@/components/ui/button";
import { useMatchId } from "@/hooks/use-match-id";
import { useMatch } from "@/hooks/use-matches";
import {
  buildMatchReportHtml,
  downloadReportHtml,
  printMatchReport,
} from "@/lib/report";
import { matchHref } from "@/lib/routes";
import { deriveState } from "@/lib/volleyball";
import { Download, Printer } from "lucide-react";

export default function ReportRoute() {
  return (
    <Suspense fallback={<PhoneShell><p className="p-6 text-sm text-muted-foreground">載入報告中…</p></PhoneShell>}>
      <ReportPage />
    </Suspense>
  );
}

function ReportPage() {
  const id = useMatchId();
  const { match } = useMatch(id);
  const html = useMemo(() => (match ? buildMatchReportHtml(match) : ""), [match]);

  if (!match) {
    return (
      <PhoneShell>
        <TopBar left={<BackLink href="/" />} title="找不到比賽" />
      </PhoneShell>
    );
  }

  const state = deriveState(match);

  return (
    <div className="min-h-dvh bg-[#1a2420] text-foreground">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0d1f18]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top))]">
          <BackLink href={matchHref(match.id, "stats")} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">A4 比賽報告</p>
            <p className="truncate text-xs font-medium text-muted-foreground">
              {match.home.name} {state.homeSets}-{state.awaySets} {match.away.name}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 px-4 py-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          這是一頁 A4 比賽報告。按「列印 / 存成 PDF」，在對話框選「儲存為 PDF」或「Microsoft Print to PDF」。也可以下載 HTML，之後用瀏覽器打開再印。
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button className="h-11 font-bold" onClick={() => printMatchReport(match)}>
            <Printer data-icon="inline-start" />
            列印 / PDF
          </Button>
          <Button
            variant="outline"
            className="h-11 font-bold"
            onClick={() => downloadReportHtml(match)}
          >
            <Download data-icon="inline-start" />
            下載 HTML
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full"
          nativeButton={false}
          render={<Link href={matchHref(match.id, "stats")} />}
        >
          返回分析
        </Button>
      </div>

      <div className="flex justify-center overflow-x-auto px-3 pb-10">
        <div className="h-[137mm] w-[97mm] shrink-0 sm:h-[214mm] sm:w-[151mm] md:h-[297mm] md:w-[210mm]">
          <iframe
            title="A4 比賽報告預覽"
            srcDoc={html}
            className="h-[297mm] w-[210mm] origin-top-left scale-[0.46] rounded-sm border border-black/20 bg-white shadow-2xl sm:scale-[0.72] md:scale-100"
          />
        </div>
      </div>
    </div>
  );
}
