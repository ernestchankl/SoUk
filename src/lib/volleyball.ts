import type {
  Action,
  DerivedSet,
  DerivedState,
  EvalCounts,
  Evaluation,
  Match,
  PlayerSkillStats,
  RallyPoint,
  Skill,
  TeamSide,
  TeamStats,
} from "@/lib/types";
import { padNumber, skillLabel } from "@/lib/codes";

export function opposite(side: TeamSide): TeamSide {
  return side === "home" ? "away" : "home";
}

export function emptyEvals(): EvalCounts {
  return { "#": 0, "+": 0, "!": 0, "-": 0, "/": 0, "=": 0, total: 0 };
}

export function isTerminal(skill: Skill, evaluation: Evaluation): boolean {
  if (skill === "Q") return true;
  if (skill === "S") return evaluation === "#" || evaluation === "=";
  if (skill === "A") return evaluation === "#" || evaluation === "=" || evaluation === "/";
  if (skill === "B") return evaluation === "#" || evaluation === "=";
  if (skill === "R" || skill === "E" || skill === "D" || skill === "F") {
    return evaluation === "=";
  }
  return false;
}

export function pointWinner(action: Pick<Action, "team" | "skill" | "evaluation">): TeamSide | undefined {
  if (!isTerminal(action.skill, action.evaluation)) return undefined;

  const opp = opposite(action.team);
  const { skill, evaluation, team } = action;

  if (skill === "Q") return team;
  if (skill === "S" && evaluation === "#") return team;
  if (skill === "S" && evaluation === "=") return opp;
  if (skill === "A" && evaluation === "#") return team;
  if (skill === "A" && evaluation === "=") return opp;
  if (skill === "A" && evaluation === "/") return opp;
  if (skill === "B" && evaluation === "#") return team;
  if (skill === "B" && evaluation === "=") return opp;
  if (evaluation === "=") return opp;
  return undefined;
}

export function setsToWin(bestOf: 3 | 5): number {
  return bestOf === 5 ? 3 : 2;
}

export function setTarget(bestOf: 3 | 5, setIndex: number): number {
  const lastSetIndex = bestOf - 1;
  return setIndex === lastSetIndex ? 15 : 25;
}

export function setIsWon(home: number, away: number, target: number): TeamSide | undefined {
  if (home >= target && home - away >= 2) return "home";
  if (away >= target && away - home >= 2) return "away";
  return undefined;
}

function newSet(index: number, firstServe: TeamSide, bestOf: 3 | 5): DerivedSet {
  return {
    index,
    home: 0,
    away: 0,
    serving: firstServe,
    firstServe,
    complete: false,
    target: setTarget(bestOf, index),
  };
}

export function deriveState(match: Match): DerivedState {
  const points: RallyPoint[] = [];
  const rally: Action[] = [];
  const sets: DerivedSet[] = [newSet(0, match.firstServe, match.bestOf)];
  let current = 0;
  let homeSets = 0;
  let awaySets = 0;
  let matchWinner: TeamSide | undefined;
  const need = setsToWin(match.bestOf);

  for (const action of match.actions) {
    if (matchWinner) break;
    const set = sets[current];
    rally.push(action);
    const winner = pointWinner(action);
    if (!winner) continue;

    set[winner] += 1;
    const kind: "sideout" | "break" = winner === set.serving ? "break" : "sideout";
    points.push({
      setIndex: current,
      winner,
      serving: set.serving,
      kind,
      actionId: action.id,
      skill: action.skill,
      evaluation: action.evaluation,
      team: action.team,
    });
    set.serving = winner;
    rally.length = 0;

    const won = setIsWon(set.home, set.away, set.target);
    if (!won) continue;

    set.complete = true;
    set.winner = won;
    if (won === "home") homeSets += 1;
    else awaySets += 1;

    if (homeSets >= need || awaySets >= need) {
      matchWinner = homeSets > awaySets ? "home" : "away";
      break;
    }

    current += 1;
    const nextFirst = opposite(set.firstServe);
    sets.push(newSet(current, nextFirst, match.bestOf));
  }

  const active = sets[current];

  return {
    sets,
    currentSetIndex: current,
    homeSets,
    awaySets,
    serving: active.serving,
    matchWinner,
    complete: Boolean(matchWinner) || match.status === "completed",
    points,
    rally: matchWinner ? [] : [...rally],
    score: { home: active.home, away: active.away },
  };
}

export function matchIsOver(match: Match): boolean {
  const state = deriveState(match);
  return Boolean(state.matchWinner);
}

export function formatCode(action: Action): string {
  const prefix = action.team === "home" ? "*" : "a";
  if (action.skill === "Q") {
    return `${prefix}P#`;
  }
  return `${prefix}${padNumber(action.playerNumber)}${action.skill}${action.evaluation}`;
}

export function formatCodeReadable(action: Action, playerName?: string): string {
  const who =
    playerName ||
    (action.playerNumber !== null ? `#${action.playerNumber}` : "未指定");
  return `${who} ${skillLabel(action.skill)}${action.evaluation}`;
}

function bump(counts: EvalCounts, evaluation: Evaluation) {
  counts[evaluation] += 1;
  counts.total += 1;
}

function emptyPlayerStats(
  team: TeamSide,
  playerId: string | null,
  number: number | null,
  name: string,
  position?: PlayerSkillStats["position"]
): PlayerSkillStats {
  return {
    playerId,
    team,
    number,
    name,
    position,
    serve: emptyEvals(),
    reception: emptyEvals(),
    set: emptyEvals(),
    attack: emptyEvals(),
    block: emptyEvals(),
    dig: emptyEvals(),
    freeball: emptyEvals(),
    quickPoints: 0,
  };
}

const SKILL_FIELD: Record<Exclude<Skill, "Q">, keyof Omit<PlayerSkillStats, "playerId" | "team" | "number" | "name" | "position" | "quickPoints">> = {
  S: "serve",
  R: "reception",
  E: "set",
  A: "attack",
  B: "block",
  D: "dig",
  F: "freeball",
};

function attackEfficiency(e: EvalCounts): number | null {
  if (e.total === 0) return null;
  return (e["#"] - e["="] - e["/"]) / e.total;
}

function serveEfficiency(e: EvalCounts): number | null {
  if (e.total === 0) return null;
  return (e["#"] - e["="]) / e.total;
}

function receptionEfficiency(e: EvalCounts): number | null {
  if (e.total === 0) return null;
  const weighted =
    e["#"] * 1 +
    e["+"] * 0.8 +
    e["!"] * 0.5 +
    e["-"] * 0.25 +
    e["/"] * 0 +
    e["="] * 0;
  return weighted / e.total;
}

function pct(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return part / whole;
}

export function computeTeamStats(match: Match, side: TeamSide): TeamStats {
  const state = deriveState(match);
  const team = side === "home" ? match.home : match.away;
  const byPlayer = new Map<string, PlayerSkillStats>();

  for (const player of team.players) {
    byPlayer.set(
      player.id,
      emptyPlayerStats(side, player.id, player.number, player.name, player.position)
    );
  }

  const teamTotals = emptyPlayerStats(side, null, null, team.name);
  const unknownKey = "__unknown__";

  const takePlayer = (action: Action): PlayerSkillStats => {
    if (action.playerId && byPlayer.has(action.playerId)) {
      return byPlayer.get(action.playerId)!;
    }
    if (!byPlayer.has(unknownKey)) {
      byPlayer.set(
        unknownKey,
        emptyPlayerStats(side, null, action.playerNumber, "未指定球員")
      );
    }
    return byPlayer.get(unknownKey)!;
  };

  for (const action of match.actions) {
    if (action.team !== side) continue;
    const player = takePlayer(action);
    if (action.skill === "Q") {
      player.quickPoints += 1;
      teamTotals.quickPoints += 1;
      continue;
    }
    const field = SKILL_FIELD[action.skill];
    bump(player[field], action.evaluation);
    bump(teamTotals[field], action.evaluation);
  }

  const sideouts = state.points.filter((p) => p.winner === side && p.kind === "sideout").length;
  const breaks = state.points.filter((p) => p.winner === side && p.kind === "break").length;
  const receiveAttempts = state.points.filter((p) => p.serving !== side).length;
  const serveAttempts = state.points.filter((p) => p.serving === side).length;

  const players = [...byPlayer.values()]
    .filter((p) => {
      const touches =
        p.serve.total +
        p.reception.total +
        p.set.total +
        p.attack.total +
        p.block.total +
        p.dig.total +
        p.freeball.total +
        p.quickPoints;
      return p.playerId !== null || touches > 0;
    })
    .sort((a, b) => (a.number ?? 99) - (b.number ?? 99));

  return {
    side,
    name: team.name,
    attack: teamTotals.attack,
    serve: teamTotals.serve,
    reception: teamTotals.reception,
    block: teamTotals.block,
    dig: teamTotals.dig,
    set: teamTotals.set,
    kills: teamTotals.attack["#"],
    attackErrors: teamTotals.attack["="],
    blocked: teamTotals.attack["/"],
    aces: teamTotals.serve["#"],
    serveErrors: teamTotals.serve["="],
    recErrors: teamTotals.reception["="],
    stuffs: teamTotals.block["#"],
    sideouts,
    breaks,
    receiveAttempts,
    serveAttempts,
    attackEfficiency: attackEfficiency(teamTotals.attack),
    serveEfficiency: serveEfficiency(teamTotals.serve),
    receptionEfficiency: receptionEfficiency(teamTotals.reception),
    sideoutPct: pct(sideouts, receiveAttempts),
    breakPct: pct(breaks, serveAttempts),
    players,
  };
}

export function formatPct(value: number | null, digits = 0): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatEff(value: number | null): string {
  if (value === null) return "—";
  const n = value * 100;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(0)}`;
}

export function playerById(match: Match, team: TeamSide, id: string | null) {
  if (!id) return undefined;
  const roster = team === "home" ? match.home.players : match.away.players;
  return roster.find((p) => p.id === id);
}

export function playerByNumber(match: Match, team: TeamSide, number: number) {
  const roster = team === "home" ? match.home.players : match.away.players;
  return roster.find((p) => p.number === number);
}
