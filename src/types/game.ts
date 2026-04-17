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
  /** 当天发现的证据数（日终总结用，ADVANCE_DAY 时重置） */
  evidenceFoundToday: number;
  bookmarkedEntries: string[];
  courtHistory: import('./court').CourtSession[];
  conflictRecords: import('./notebook').ConflictRecord[];
  deputyTaskActive: import('./deputy').DeputyTask | null;
  deputyResultPending: import('./deputy').DeputyResult | null;
  accusationsMade: Accusation[];
  storyLog: StoryLogEntry[];
  tutorialStep: number;
  activeConversationNpc: import('./npc').NpcId | null;
  /** v3: 已接触过的NPC（用于差役任务动态过滤） */
  visitedNpcIds: import('./npc').NpcId[];
  /** v3: 已到访过的地点（用于差役任务动态过滤） */
  visitedLocationIds: LocationId[];
  /** v3: NPC 是否进入警觉状态（刘万全警觉后提前触发账本销毁事件） */
  npcAlerted: Partial<Record<import('./npc').NpcId, boolean>>;
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
  | { type: 'ADD_CONFLICT_RECORD'; record: import('./notebook').ConflictRecord }
  | { type: 'SET_NPC_ALERTED'; npcId: import('./npc').NpcId };
