import type { Evaluation, Position, Skill } from "@/lib/types";

export const SKILLS: { code: Skill; label: string; short: string }[] = [
  { code: "S", label: "發球", short: "發" },
  { code: "R", label: "接發", short: "接" },
  { code: "E", label: "舉球", short: "舉" },
  { code: "A", label: "攻擊", short: "攻" },
  { code: "B", label: "攔網", short: "攔" },
  { code: "D", label: "防守", short: "防" },
  { code: "F", label: "自由球", short: "自" },
];

export const EVALUATIONS: Evaluation[] = ["#", "+", "!", "-", "/", "="];

export const EVAL_META: Record<
  Evaluation,
  { label: string; meaning: string; className: string }
> = {
  "#": {
    label: "完美",
    meaning: "得分 / 最佳",
    className:
      "bg-emerald-500 text-emerald-950 border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]",
  },
  "+": {
    label: "正面",
    meaning: "可組織進攻",
    className: "bg-lime-400 text-lime-950 border-lime-200",
  },
  "!": {
    label: "普通",
    meaning: "可處理",
    className: "bg-amber-300 text-amber-950 border-amber-200",
  },
  "-": {
    label: "負面",
    meaning: "難以進攻",
    className: "bg-orange-400 text-orange-950 border-orange-200",
  },
  "/": {
    label: "過網",
    meaning: "被攔 / 過網",
    className: "bg-rose-400 text-rose-950 border-rose-200",
  },
  "=": {
    label: "失誤",
    meaning: "直接失分",
    className: "bg-red-600 text-white border-red-400",
  },
};

export const POSITIONS: { code: Position; label: string }[] = [
  { code: "S", label: "舉球" },
  { code: "OH", label: "主攻" },
  { code: "MB", label: "副攻" },
  { code: "OP", label: "對角" },
  { code: "L", label: "自由" },
  { code: "U", label: "萬能" },
];

const SKILL_EVAL_HINT: Record<Skill, Partial<Record<Evaluation, string>>> = {
  S: { "#": "發球得分", "+": "強攻接", "!": "中規中矩", "-": "輕鬆接", "/": "出界擦網", "=": "發球失誤" },
  R: { "#": "完美一傳", "+": "正面一傳", "!": "可舉球", "-": "困難一傳", "/": "過網", "=": "接發失誤" },
  E: { "#": "最佳舉球", "+": "好球", "!": "可打", "-": "困難", "/": "過網", "=": "舉球失誤" },
  A: { "#": "扣死", "+": "繼續攻防", "!": "被防起", "-": "弱攻", "/": "被攔死", "=": "攻擊失誤" },
  B: { "#": "攔死", "+": "有效觸球", "!": "觸球", "-": "無效", "/": "觸手出界", "=": "攔網犯規" },
  D: { "#": "完美防守", "+": "可組織", "!": "救起", "-": "困難", "/": "過網", "=": "防守失誤" },
  F: { "#": "完美處理", "+": "可組織", "!": "可打", "-": "困難", "/": "過網", "=": "處理失誤" },
  Q: { "#": "未標記得分" },
};

export function skillLabel(skill: Skill): string {
  if (skill === "Q") return "得分";
  return SKILLS.find((s) => s.code === skill)?.label ?? skill;
}

export function positionLabel(position: Position): string {
  return POSITIONS.find((p) => p.code === position)?.label ?? position;
}

export function evalHint(skill: Skill, evaluation: Evaluation): string {
  return SKILL_EVAL_HINT[skill][evaluation] ?? EVAL_META[evaluation].label;
}

export function padNumber(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "??";
  return String(n).padStart(2, "0");
}
