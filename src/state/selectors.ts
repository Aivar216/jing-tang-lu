import type { GameState } from '../types/game';
import type { NpcId } from '../types/npc';
import type { LocationId } from '../types/game';
import { LAYER2_EVIDENCE_TRIGGER, LAYER2_TIME_TRIGGER_DAY } from '../data/events/layer2Triggers';

export function canInitiateCourt(state: GameState): boolean {
  return state.courtSessionsRemaining > 0 && state.gamePhase === 'investigation';
}

export function canAdvanceDay(state: GameState): boolean {
  return state.gamePhase === 'investigation';
}

export function canDispatchDeputy(state: GameState): boolean {
  return state.deputyTaskActive === null && state.gamePhase === 'investigation';
}

export function shouldTriggerLayer2(state: GameState): boolean {
  if (state.layer2Triggered) return false;
  const hasEvidenceTrigger = LAYER2_EVIDENCE_TRIGGER.every(id =>
    state.evidenceFound.includes(id)
  );
  const hasTimeTrigger = state.currentDay >= LAYER2_TIME_TRIGGER_DAY;
  return hasEvidenceTrigger || hasTimeTrigger;
}

export function getActiveCourtSession(state: GameState) {
  return state.courtHistory.find(s => s.isActive) ?? null;
}

export function getNpcTrustLabel(trust: number): string {
  if (trust >= 80) return '信任';
  if (trust >= 50) return '中立';
  if (trust >= 30) return '警惕';
  return '敌对';
}

export function isLocationUnlocked(locationId: LocationId, state: GameState): boolean {
  const lockedUntilDay2: LocationId[] = ['zhou_study', 'pawnshop', 'gambling_den'];
  if (lockedUntilDay2.includes(locationId) && state.currentDay < 2) return false;
  return true;
}

export function isNpcAvailable(npcId: NpcId, state: GameState): boolean {
  if (state.npcs[npcId].isArrested) return false;
  if (state.credibilityScore < 40) {
    const alwaysAvailable: NpcId[] = ['li_mingde', 'song_wuzuo'];
    if (!alwaysAvailable.includes(npcId)) return false;
  }
  return true;
}

export function getGameEndingType(state: GameState): 'perfect' | 'basic' | 'failure' | null {
  if (state.gamePhase !== 'ended') return null;
  const lastAccusation = state.accusationsMade[state.accusationsMade.length - 1];
  if (!lastAccusation || lastAccusation.context !== 'final_judgment') return null;
  if (!lastAccusation.wasCorrect) return 'failure';
  const hasLayer2 = state.layer2Triggered &&
    state.evidenceFound.includes('ledger_shadow') &&
    state.evidenceFound.includes('large_transfers_to_bank');
  return hasLayer2 ? 'perfect' : 'basic';
}
