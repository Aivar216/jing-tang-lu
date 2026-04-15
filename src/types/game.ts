export type GamePhase =
  | 'tutorial'
  | 'investigation'
  | 'court'
  | 'day_end'
  | 'final_judgment'
  | 'ended';

export type TimePeriod = 'morning' | 'afternoon' | 'evening';

export type LocationId =
  | 'county_office'
  | 'zhou_house'
  | 'warehouse_scene'
  | 'zhou_study'
  | 'pawnshop'
  | 'gambling_den'
  | 'tavern'
  | 'sun_popo_alley'
  | 'coroner_office';

export interface LocationDef {
  id: LocationId;
  name: string;
  description: string;
  npcIds: import('./npc').NpcId[];
  unlockedFromDay?: number;
  requiresLayer2?: boolean;
}

export interface GameState {
  pressureUsed: Partial<Record<import('./npc').NpcId, number>>;  // 每NPC施压次数（上限2）
  currentDay: number;
  currentPeriod: TimePeriod;
  actionPoints: number;
  courtSessionsRemaining: number;
  credibilityScore: number;
  currentLocation: LocationId;
  gamePhase: GamePhase;
  layer2Triggered: boolean;
  layer2TriggerMethod: 'evidence' | 'time' | null;
  npcs: Record<import('./npc').NpcId, import('./npc').NpcState>;
  notebookEntries: import('./notebook').NotebookEntry[];
  evidenceFound: import('./evidence').EvidenceId[];
  bookmarkedEntries: string[];
  courtHistory: import('./court').CourtSession[];
  conflictRecords: import('./notebook').ConflictRecord[];
  deputyTaskActive: import('./deputy').DeputyTask | null;
  deputyResultPending: import('./deputy').DeputyResult | null;
  accusationsMade: Accusation[];
  storyLog: StoryLogEntry[];
  tutorialStep: number;
  activeConversationNpc: import('./npc').NpcId | null;
}

/** 剧情日志条目 */
export type StoryLogType = 'narration' | 'evidence' | 'court' | 'day_change' | 'event' | 'deputy';
export interface StoryLogEntry {
  id: string;
  day: number;
  type: StoryLogType;
  icon: string;
  title: string;
  content: string;
}

export interface Accusation {
  day: number;
  accusedNpcId: import('./npc').NpcId;
  context: 'court' | 'final_judgment';
  wasCorrect: boolean;
}

export type GameAction =
  | { type: 'START_CONVERSATION'; npcId: import('./npc').NpcId }
  | { type: 'SEND_MESSAGE'; npcId: import('./npc').NpcId; playerMessage: string; npcResponse: string }
  | { type: 'END_CONVERSATION'; npcId: import('./npc').NpcId; entry: import('./notebook').NotebookEntry | null }
  | { type: 'MOVE_TO_LOCATION'; locationId: LocationId }
  | { type: 'ADVANCE_DAY' }
  | { type: 'ADD_EVIDENCE'; evidenceId: import('./evidence').EvidenceId }
  | { type: 'UPDATE_NPC_TRUST'; npcId: import('./npc').NpcId; delta: number }
  | { type: 'SET_NPC_FLAG'; npcId: import('./npc').NpcId; flag: string; value: boolean }
  | { type: 'DISPATCH_DEPUTY'; task: import('./deputy').DeputyTask }
  | { type: 'RESOLVE_DEPUTY'; result: import('./deputy').DeputyResult }
  | { type: 'START_COURT'; participants: import('./npc').NpcId[] }
  | { type: 'ADD_COURT_TURN'; sessionId: string; turn: import('./court').CourtTurn }
  | { type: 'END_COURT'; sessionId: string; verdict: import('./court').Verdict; arrestedNpcId?: import('./npc').NpcId }
  | { type: 'TOGGLE_BOOKMARK'; entryId: string }
  | { type: 'TRIGGER_LAYER2'; method: 'evidence' | 'time' }
  | { type: 'MAKE_ACCUSATION'; accusation: Accusation }
  | { type: 'CHANGE_CREDIBILITY'; delta: number }
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'ADD_NOTEBOOK_ENTRY'; entry: import('./notebook').NotebookEntry }
  | { type: 'ADD_STORY_LOG'; entry: StoryLogEntry }
  | { type: 'USE_PRESSURE'; npcId: import('./npc').NpcId }
  | { type: 'ADD_CONFLICT_RECORD'; record: import('./notebook').ConflictRecord };
