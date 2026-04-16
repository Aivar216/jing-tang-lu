import type { GameState } from '../types/game';
import type { NpcId } from '../types/npc';
import type { NpcState } from '../types/npc';

const NPC_IDS: NpcId[] = [
  'chen_si', 'qin_shi', 'liu_wanquan', 'zhou_fu', 'ma_liu',
  'song_wuzuo', 'li_mingde', 'wang_danian', 'sun_popo',
];

function createInitialNpcState(): NpcState {
  return {
    trust: 50,
    conversationHistory: [],
    revealedFactIds: [],
    flags: {},
    isArrested: false,
  };
}

export const INITIAL_STATE: GameState = {
  currentDay: 1,
  currentPeriod: 'morning',
  actionPoints: 3,
  courtSessionsRemaining: 2,
  credibilityScore: 100,
  currentLocation: 'county_office',
  gamePhase: 'tutorial',
  layer2Triggered: false,
  layer2TriggerMethod: null,
  npcs: Object.fromEntries(
    NPC_IDS.map(id => [id, createInitialNpcState()])
  ) as Record<NpcId, NpcState>,
  notebookEntries: [],
  evidenceFound: [],
  bookmarkedEntries: [],
  courtHistory: [],
  conflictRecords: [],
  deputyTaskActive: null,
  deputyResultPending: null,
  accusationsMade: [],
  pressureUsed: {},
  storyLog: [],
  tutorialStep: 0,
  activeConversationNpc: null,
  visitedNpcIds: [],
  visitedLocationIds: [],
  npcAlerted: {},
};
