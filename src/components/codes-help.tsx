"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EVAL_META, EVALUATIONS, SKILLS } from "@/lib/codes";
import { cn } from "@/lib/utils";

export function CodesHelp() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        代碼
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Volley 簡化代碼</DialogTitle>
          <DialogDescription>
            記錄順序是「球員 → 技術 → 評價」。帶白框的評價會結束這一分。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="font-mono text-muted-foreground">*12A# = 主隊 12 號攻擊得分</p>
          <div>
            <p className="mb-1.5 font-medium">技術</p>
            <ul className="grid grid-cols-2 gap-1.5">
              {SKILLS.map((s) => (
                <li key={s.code} className="rounded-lg bg-white/5 px-2 py-1.5">
                  <span className="font-mono font-bold">{s.code}</span> {s.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 font-medium">評價</p>
            <ul className="space-y-1.5">
              {EVALUATIONS.map((ev) => (
                <li key={ev} className="flex items-center gap-2">
                  <span className={cn("inline-block min-w-7 rounded px-1 text-center font-mono", EVAL_META[ev].className)}>
                    {ev}
                  </span>
                  <span>
                    {EVAL_META[ev].label} · {EVAL_META[ev].meaning}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BackLink({ href, label = "返回" }: { href: string; label?: string }) {
  return (
    <Button variant="ghost" size="icon" className="size-8" nativeButton={false} render={<Link href={href} />}>
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Button>
  );
}
