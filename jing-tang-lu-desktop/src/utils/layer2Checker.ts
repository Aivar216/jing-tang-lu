import type { GameState } from '../types/game';
import { LAYER2_EVIDENCE_TRIGGER, LAYER2_TIME_TRIGGER_DAY } from '../data/events/layer2Triggers';

export function checkAndGetLayer2TriggerMethod(
  state: GameState
): 'evidence' | 'time' | null {
  if (state.layer2Triggered) return null;

  const hasEvidenceTrigger = LAYER2_EVIDENCE_TRIGGER.every(id =>
    state.evidenceFound.includes(id as never)
  );

  if (hasEvidenceTrigger) return 'evidence';
  if (state.currentDay >= LAYER2_TIME_TRIGGER_DAY) return 'time';
  return null;
}
