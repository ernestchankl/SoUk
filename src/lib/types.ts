export type TeamSide = "home" | "away";

export type Skill = "S" | "R" | "E" | "A" | "B" | "D" | "F" | "Q";

export type Evaluation = "#" | "+" | "!" | "-" | "/" | "=";

export type Position = "S" | "OH" | "MB" | "OP" | "L" | "U";

export type BestOf = 3 | 5;

export interface Player {
  id: string;
  number: number;
  name: string;
  position: Position;
}

export interface Team {
  name: string;
  shortName: string;
  players: Player[];
}

export interface Action {
  id: string;
  team: TeamSide;
  playerId: string | null;
  playerNumber: number | null;
  skill: Skill;
  evaluation: Evaluation;
  at: number;
}

export interface Match {
  id: string;
  createdAt: number;
  updatedAt: number;
  home: Team;
  away: Team;
  bestOf: BestOf;
  firstServe: TeamSide;
  status: "live" | "completed";
  actions: Action[];
  notes?: string;
}

export interface DerivedSet {
  index: number;
  home: number;
  away: number;
  serving: TeamSide;
  firstServe: TeamSide;
  winner?: TeamSide;
  complete: boolean;
  target: number;
}

export interface RallyPoint {
  setIndex: number;
  winner: TeamSide;
  serving: TeamSide;
  kind: "sideout" | "break";
  actionId: string;
  skill: Skill;
  evaluation: Evaluation;
  team: TeamSide;
}

export interface DerivedState {
  sets: DerivedSet[];
  currentSetIndex: number;
  homeSets: number;
  awaySets: number;
  serving: TeamSide;
  matchWinner?: TeamSide;
  complete: boolean;
  points: RallyPoint[];
  rally: Action[];
  score: { home: number; away: number };
}

export interface EvalCounts {
  "#": number;
  "+": number;
  "!": number;
  "-": number;
  "/": number;
  "=": number;
  total: number;
}

export interface PlayerSkillStats {
  playerId: string | null;
  team: TeamSide;
  number: number | null;
  name: string;
  position?: Position;
  serve: EvalCounts;
  reception: EvalCounts;
  set: EvalCounts;
  attack: EvalCounts;
  block: EvalCounts;
  dig: EvalCounts;
  freeball: EvalCounts;
  quickPoints: number;
}

export interface TeamStats {
  side: TeamSide;
  name: string;
  attack: EvalCounts;
  serve: EvalCounts;
  reception: EvalCounts;
  block: EvalCounts;
  dig: EvalCounts;
  set: EvalCounts;
  kills: number;
  attackErrors: number;
  blocked: number;
  aces: number;
  serveErrors: number;
  recErrors: number;
  stuffs: number;
  sideouts: number;
  breaks: number;
  receiveAttempts: number;
  serveAttempts: number;
  attackEfficiency: number | null;
  serveEfficiency: number | null;
  receptionEfficiency: number | null;
  setEfficiency: number | null;
  sideoutPct: number | null;
  breakPct: number | null;
  players: PlayerSkillStats[];
}
