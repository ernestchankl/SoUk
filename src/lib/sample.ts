import type { Action, Evaluation, Match, Player, Skill, Team, TeamSide } from "@/lib/types";
import { uid } from "@/lib/id";
import { deriveState, opposite, pointWinner, setIsWon } from "@/lib/volleyball";
import sampleMatch from "@/lib/sample-match.json";

function player(number: number, name: string, position: Player["position"]): Player {
  return { id: uid(), number, name, position };
}

function team(name: string, shortName: string, players: Player[]): Team {
  return { name, shortName, players };
}

class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  next(): number {
    this.s = (1664525 * this.s + 1013904223) >>> 0;
    return this.s / 0x100000000;
  }
  pick<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)]!;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
}

function action(
  teamSide: TeamSide,
  p: Player | undefined,
  skill: Skill,
  evaluation: Evaluation,
  at: number
): Action {
  return {
    id: uid(),
    team: teamSide,
    playerId: p?.id ?? null,
    playerNumber: p?.number ?? null,
    skill,
    evaluation,
    at,
  };
}

function attackers(roster: Team): Player[] {
  return roster.players.filter((p) => p.position !== "L" && p.position !== "S");
}

function setter(roster: Team): Player {
  return roster.players.find((p) => p.position === "S") ?? roster.players[0]!;
}

function libero(roster: Team): Player {
  return roster.players.find((p) => p.position === "L") ?? roster.players[0]!;
}

function receiver(roster: Team, rng: Rng): Player {
  const rec = roster.players.filter((p) => p.position === "OH" || p.position === "L");
  return rng.pick(rec.length ? rec : roster.players);
}

function server(roster: Team, rng: Rng): Player {
  const servers = roster.players.filter((p) => p.position !== "L");
  return rng.pick(servers.length ? servers : roster.players);
}

function blocker(roster: Team, rng: Rng): Player {
  const mids = roster.players.filter((p) => p.position === "MB");
  return rng.pick(mids.length ? mids : attackers(roster));
}

function buildPoint(
  winner: TeamSide,
  serving: TeamSide,
  home: Team,
  away: Team,
  rng: Rng,
  at: number
): Action[] {
  const servingTeam = serving === "home" ? home : away;
  const receivingTeam = serving === "home" ? away : home;
  const winTeam = winner === "home" ? home : away;
  const loseTeam = winner === "home" ? away : home;
  const out: Action[] = [];
  let t = at;

  const push = (
    side: TeamSide,
    p: Player | undefined,
    skill: Skill,
    evaluation: Evaluation
  ) => {
    out.push(action(side, p, skill, evaluation, t));
    t += 800 + Math.floor(rng.next() * 1200);
  };

  const serveIn = () => {
    push(serving, server(servingTeam, rng), "S", rng.pick(["+", "!", "-"]));
    push(
      opposite(serving),
      receiver(receivingTeam, rng),
      "R",
      rng.pick(["#", "+", "!", "-"])
    );
  };

  if (winner === serving) {
    const kind = rng.next();
    if (kind < 0.2) {
      push(serving, server(servingTeam, rng), "S", "#");
      return out;
    }
    if (kind < 0.36) {
      push(serving, server(servingTeam, rng), "S", rng.pick(["+", "!"]));
      push(opposite(serving), receiver(receivingTeam, rng), "R", "=");
      return out;
    }
    serveIn();
    push(opposite(serving), setter(receivingTeam), "E", rng.pick(["+", "!"]));
    if (rng.chance(0.4)) {
      push(opposite(serving), rng.pick(attackers(receivingTeam)), "A", rng.pick(["=", "/"]));
      return out;
    }
    push(opposite(serving), rng.pick(attackers(receivingTeam)), "A", rng.pick(["+", "!"]));
    push(serving, libero(servingTeam), "D", rng.pick(["+", "!"]));
    push(serving, setter(servingTeam), "E", rng.pick(["+", "#"]));
    if (rng.chance(0.22)) {
      push(serving, blocker(winTeam, rng), "B", "#");
    } else {
      push(serving, rng.pick(attackers(winTeam)), "A", "#");
    }
    return out;
  }

  if (rng.chance(0.26)) {
    push(serving, server(servingTeam, rng), "S", "=");
    return out;
  }

  serveIn();
  push(opposite(serving), setter(receivingTeam), "E", rng.pick(["+", "#", "!"]));
  const finish = rng.next();
  if (finish < 0.18) {
    push(serving, rng.pick(attackers(loseTeam)), "A", rng.pick(["=", "/"]));
  } else if (finish < 0.34) {
    push(winner, blocker(winTeam, rng), "B", "#");
  } else {
    push(winner, rng.pick(attackers(winTeam)), "A", "#");
  }
  return out;
}

function finalizePoint(
  generated: Action[],
  winner: TeamSide,
  winTeam: Team,
  rng: Rng
): Action[] {
  const idx = generated.findIndex((item) => pointWinner(item));
  if (idx >= 0 && pointWinner(generated[idx]) === winner) {
    const exact = generated.slice(0, idx + 1);
    if (exact.filter((item) => pointWinner(item)).length !== 1) {
      throw new Error("rally had extra finishing actions");
    }
    return exact;
  }
  const kept = (idx >= 0 ? generated.slice(0, idx) : [...generated]).filter(
    (item) => !pointWinner(item)
  );
  const lastAt = kept.at(-1)?.at ?? generated[0]?.at ?? Date.now();
  const finishers = [
    action(winner, rng.pick(attackers(winTeam)), "A", "#", lastAt + 900),
    action(winner, server(winTeam, rng), "S", "#", lastAt + 900),
    action(winner, blocker(winTeam, rng), "B", "#", lastAt + 900),
  ];
  kept.push(rng.pick(finishers));
  const terminals = kept.filter((item) => pointWinner(item));
  if (terminals.length !== 1 || pointWinner(kept.at(-1)!) !== winner) {
    throw new Error("generated rally did not end with the intended point");
  }
  return kept;
}

function generateMatchActions(
  home: Team,
  away: Team,
  firstServe: TeamSide,
  bestOf: 3 | 5,
  setScores: Array<[number, number]>,
  rng: Rng,
  startAt: number
): Action[] {
  const actions: Action[] = [];
  let t = startAt;
  const skeleton = (nextActions: Action[]): Match => ({
    id: "gen",
    createdAt: startAt,
    updatedAt: t,
    home,
    away,
    bestOf,
    firstServe,
    status: "live",
    actions: nextActions,
  });

  for (const [targetHome, targetAway] of setScores) {
    const setIndex = deriveState(skeleton(actions)).currentSetIndex;
    let guard = 0;
    while (guard < 200) {
      guard += 1;
      const state = deriveState(skeleton(actions));
      const set = state.sets[setIndex];
      if (set.complete && set.home === targetHome && set.away === targetAway) break;
      if (set.complete || state.matchWinner) {
        throw new Error(
          `unexpected stop at set ${set.index + 1} ${set.home}-${set.away}, wanted ${targetHome}-${targetAway}`
        );
      }

      const homeWouldWin = Boolean(setIsWon(set.home + 1, set.away, set.target));
      const awayWouldWin = Boolean(setIsWon(set.home, set.away + 1, set.target));
      let winner: TeamSide;
      if (set.home >= targetHome) winner = "away";
      else if (set.away >= targetAway) winner = "home";
      else if (homeWouldWin && set.away < targetAway) winner = "away";
      else if (awayWouldWin && set.home < targetHome) winner = "home";
      else {
        const homeNeeds = targetHome - set.home;
        const awayNeeds = targetAway - set.away;
        const homeBias = homeNeeds < awayNeeds ? 0.58 : homeNeeds > awayNeeds ? 0.42 : 0.5;
        winner = rng.next() < homeBias ? "home" : "away";
      }

      const winTeam = winner === "home" ? home : away;
      const point = finalizePoint(
        buildPoint(winner, set.serving, home, away, rng, t),
        winner,
        winTeam,
        rng
      );
      actions.push(...point);
      t = (point.at(-1)?.at ?? t) + 1500;
    }
  }

  return actions;
}

export function createBlankTeam(name: string, shortName: string): Team {
  const template: Array<[number, Player["position"]]> = [
    [1, "S"],
    [4, "OH"],
    [7, "OH"],
    [9, "MB"],
    [5, "MB"],
    [12, "OP"],
    [2, "L"],
  ];
  return {
    name,
    shortName,
    players: template.map(([number, position]) => player(number, "", position)),
  };
}

export const HOME_ROSTER: Array<[number, string, Player["position"]]> = [
  [1, "陳安", "S"],
  [4, "林子晴", "OH"],
  [7, "黃柏毅", "OH"],
  [9, "吳心妍", "MB"],
  [5, "周子涵", "MB"],
  [12, "張偉哲", "OP"],
  [2, "許恩齊", "L"],
];

export const AWAY_ROSTER: Array<[number, string, Player["position"]]> = [
  [3, "劉冠宇", "S"],
  [6, "蔡宜庭", "OH"],
  [8, "鄭浩然", "OH"],
  [10, "王詩涵", "MB"],
  [11, "楊詠晴", "MB"],
  [13, "李承翰", "OP"],
  [16, "洪嘉玲", "L"],
];

export function createNamedTeam(
  name: string,
  shortName: string,
  roster: Array<[number, string, Player["position"]]>
): Team {
  return team(
    name,
    shortName,
    roster.map(([number, playerName, position]) => player(number, playerName, position))
  );
}

export function buildGeneratedSampleMatch(): Match {
  const home = createNamedTeam("海大藍鯨", "藍鯨", HOME_ROSTER);
  const away = createNamedTeam("北市紅隼", "紅隼", AWAY_ROSTER);
  const rng = new Rng(20260919);
  const bestOf = 3 as const;
  const actions = generateMatchActions(
    home,
    away,
    "home",
    bestOf,
    [
      [25, 21],
      [22, 25],
      [15, 12],
    ],
    rng,
    Date.now() - 1000 * 60 * 90
  );

  const match: Match = {
    id: uid(),
    createdAt: Date.now() - 1000 * 60 * 95,
    updatedAt: Date.now() - 1000 * 60 * 5,
    home,
    away,
    bestOf,
    firstServe: "home",
    status: "completed",
    notes: "示範場次：友誼賽三局兩勝，可直接查看數據分析。",
    actions,
  };

  const state = deriveState(match);
  if (!state.matchWinner) {
    match.status = "live";
  }
  return match;
}

export function createSampleMatch(): Match {
  const match = structuredClone(sampleMatch) as Match;
  match.id = uid();
  match.createdAt = Date.now() - 1000 * 60 * 95;
  match.updatedAt = Date.now() - 1000 * 60 * 5;
  match.actions = match.actions.map((action) => ({ ...action, id: uid() }));
  return match;
}

export function createFreshMatch(): Match {
  return {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    home: createBlankTeam("我方", "我方"),
    away: createBlankTeam("對方", "對方"),
    bestOf: 5,
    firstServe: "home",
    status: "live",
    actions: [],
  };
}
