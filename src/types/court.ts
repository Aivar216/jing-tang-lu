import type { NpcId } from './npc';

export type CourtTurnActor = NpcId | 'player' | 'narrator';

export interface CourtTurn {
  actor: CourtTurnActor;
  content: string;
  citedEntryId?: string;
}

export type Verdict = 'arrest' | 'release' | 'adjourn';

export interface CourtSession {
  id: string;
  day: number;
  participants: NpcId[];
  turns: CourtTurn[];
  verdict: Verdict | null;
  arrestedNpcId?: NpcId;
  isActive: boolean;
}
