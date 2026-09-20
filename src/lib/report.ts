import { positionLabel } from "@/lib/codes";
import type { EvalCounts, Match, PlayerSkillStats, TeamStats } from "@/lib/types";
import {
  attackEfficiency,
  computeTeamStats,
  deriveState,
  formatEff,
  formatPct,
  qualityEfficiency,
} from "@/lib/volleyball";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function reportFileBase(match: Match): string {
  const date = new Date(match.createdAt);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}-${match.home.shortName}-vs-${match.away.shortName}`.replace(/\s+/g, "");
}

export function reportHtmlFilename(match: Match): string {
  return `${reportFileBase(match)}.html`;
}

function evalCell(counts: EvalCounts): string {
  if (counts.total === 0) return "—";
  return `${counts["#"]}/${counts["="]}/${counts.total}`;
}

function hasTouches(p: PlayerSkillStats): boolean {
  return (
    p.serve.total +
      p.reception.total +
      p.set.total +
      p.attack.total +
      p.block.total +
      p.dig.total +
      p.freeball.total +
      p.quickPoints >
    0
  );
}

function playerRow(p: PlayerSkillStats): string {
  return `<tr>
    <td>${p.number ?? "—"} ${esc(p.name)}${p.position ? ` <span class="pos">${esc(positionLabel(p.position))}</span>` : ""}</td>
    <td class="num">${esc(formatEff(attackEfficiency(p.attack)))}</td>
    <td class="num">${p.attack["#"]}/${p.attack["="]}</td>
    <td class="num">${p.serve["#"]}/${p.serve["="]}</td>
    <td class="num">${esc(formatPct(qualityEfficiency(p.reception)))}</td>
    <td class="num">${esc(formatPct(qualityEfficiency(p.set)))}</td>
    <td class="num">${p.set["#"]}/${p.set["="]}</td>
    <td class="num">${p.block["#"]}</td>
  </tr>`;
}

function rosterTable(stats: TeamStats): string {
  const rows = stats.players.filter(hasTouches);
  const body =
    rows.length === 0
      ? `<tr><td colspan="8" class="muted center">還沒有球員數據</td></tr>`
      : rows.map(playerRow).join("");
  return `
    <table>
      <caption>${esc(stats.name)}　球員數據</caption>
      <thead>
        <tr>
          <th>球員</th>
          <th>攻效</th>
          <th>扣/失</th>
          <th>ACE/失</th>
          <th>接發</th>
          <th>舉效</th>
          <th>舉#/=</th>
          <th>攔死</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function teamBox(stats: TeamStats, tone: "home" | "away"): string {
  return `
    <section class="team ${tone}">
      <h2>${esc(stats.name)}</h2>
      <div class="kpis">
        <div><span>攻擊效率</span><strong>${esc(formatEff(stats.attackEfficiency))}</strong></div>
        <div><span>接發效率</span><strong>${esc(formatPct(stats.receptionEfficiency))}</strong></div>
        <div><span>舉球效率</span><strong>${esc(formatPct(stats.setEfficiency))}</strong></div>
        <div><span>Side-out</span><strong>${esc(formatPct(stats.sideoutPct))}</strong></div>
        <div><span>Break</span><strong>${esc(formatPct(stats.breakPct))}</strong></div>
        <div><span>扣死 / ACE / 攔死</span><strong>${stats.kills} / ${stats.aces} / ${stats.stuffs}</strong></div>
      </div>
      <p class="line">攻擊 ${evalCell(stats.attack)}　發球 ${evalCell(stats.serve)}　接發 ${evalCell(stats.reception)}　舉球 ${evalCell(stats.set)}　攔網 ${evalCell(stats.block)}</p>
      <p class="hint">數字為 完美# / 失誤= / 總數。舉球效率：# 1.0、+ 0.8、! 0.5、- 0.25。</p>
    </section>
  `;
}

export function buildMatchReportHtml(match: Match): string {
  const state = deriveState(match);
  const home = computeTeamStats(match, "home");
  const away = computeTeamStats(match, "away");
  const playedAt = new Date(match.createdAt).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const result = state.matchWinner
    ? `${state.matchWinner === "home" ? match.home.name : match.away.name} 獲勝`
    : "進行中";
  const sets = state.sets
    .map((set) => `第${set.index + 1}局 ${set.home}-${set.away}`)
    .join("　");

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(match.home.shortName)} vs ${esc(match.away.shortName)} 比賽報告</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #14241c;
      font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
    }
    .page {
      width: 194mm;
      min-height: 277mm;
      margin: 0 auto;
      font-size: 9.5pt;
      line-height: 1.25;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2.5px solid #1f6f4a;
      padding-bottom: 4mm;
      margin-bottom: 4mm;
    }
    .brand { font-size: 9pt; letter-spacing: 0.18em; color: #1f6f4a; font-weight: 700; }
    h1 { margin: 1mm 0 0; font-size: 16pt; }
    .meta { text-align: right; font-size: 9pt; color: #44584d; }
    .score {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 4mm;
      align-items: center;
      margin-bottom: 3.5mm;
    }
    .score .name { font-size: 12pt; font-weight: 800; }
    .score .home { color: #0f766e; }
    .score .away { color: #b45309; text-align: right; }
    .score .sets {
      font-family: ui-monospace, "Geist Mono", Menlo, monospace;
      font-size: 22pt;
      font-weight: 900;
      text-align: center;
    }
    .setline { text-align: center; color: #44584d; margin: -1mm 0 3.5mm; font-size: 9pt; }
    .teams { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-bottom: 3.5mm; }
    .team { border: 1px solid #d7e4dc; border-radius: 3mm; padding: 2.5mm 3mm; }
    .team.home { border-top: 3px solid #0f766e; }
    .team.away { border-top: 3px solid #b45309; }
    .team h2 { margin: 0 0 2mm; font-size: 11pt; }
    .kpis { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5mm; }
    .kpis div { background: #f4f8f5; border-radius: 1.5mm; padding: 1.4mm 1.8mm; }
    .kpis span { display: block; font-size: 7.5pt; color: #5b7166; }
    .kpis strong { font-size: 11pt; }
    .line { margin: 2mm 0 0; font-size: 8pt; }
    .hint { margin: 0.6mm 0 0; font-size: 7.5pt; color: #6b7f74; }
    table { width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 3mm; }
    caption { text-align: left; font-weight: 700; padding-bottom: 1mm; font-size: 9.5pt; }
    th, td { border-bottom: 1px solid #e4eee8; padding: 1mm 1.1mm; text-align: left; }
    th { background: #eef5f0; font-weight: 700; color: #355246; }
    td.num, th:not(:first-child) { text-align: center; font-variant-numeric: tabular-nums; }
    .pos { color: #6b7f74; font-size: 7.5pt; }
    .muted { color: #6b7f74; }
    .center { text-align: center; }
    footer {
      margin-top: 2mm;
      border-top: 1px solid #d7e4dc;
      padding-top: 2mm;
      font-size: 7.5pt;
      color: #6b7f74;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      html, body { background: #fff; }
      .page { width: auto; min-height: auto; }
    }
  </style>
</head>
<body>
  <article class="page">
    <header>
      <div>
        <div class="brand">蘇屋排球隊 STAT APP</div>
        <h1>比賽數據報告</h1>
      </div>
      <div class="meta">
        ${esc(playedAt)}<br />
        ${match.bestOf === 5 ? "五局三勝" : "三局兩勝"} · ${esc(result)}
      </div>
    </header>
    <div class="score">
      <div class="name home">${esc(match.home.name)}</div>
      <div class="sets">${state.homeSets} : ${state.awaySets}</div>
      <div class="name away">${esc(match.away.name)}</div>
    </div>
    <p class="setline">${esc(sets)}</p>
    <div class="teams">
      ${teamBox(home, "home")}
      ${teamBox(away, "away")}
    </div>
    ${rosterTable(home)}
    ${rosterTable(away)}
    <footer>
      <span>A4 單頁報告 · 用瀏覽器「列印」可存成 PDF</span>
      <span>${esc(match.home.shortName)} vs ${esc(match.away.shortName)}</span>
    </footer>
  </article>
</body>
</html>`;
}

export function downloadReportHtml(match: Match) {
  const html = buildMatchReportHtml(match);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = reportHtmlFilename(match);
  a.click();
  URL.revokeObjectURL(url);
}

export function printMatchReport(match: Match) {
  const html = buildMatchReportHtml(match);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const done = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 1500);
  };
  window.setTimeout(done, 120);
}
