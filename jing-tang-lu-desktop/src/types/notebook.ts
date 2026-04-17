import type { NpcId } from './npc';
import type { LocationId, TimePeriod } from './game';

export type ClaimCategory = 'time' | 'location' | 'person' | 'object' | 'motive';

/** Phase 3: 笔记条目的来源类型 */
export type NotebookEntryType = 'testimony' | 'physical' | 'observation';

export interface Claim {
  id: string;
  content: string;
  category: ClaimCategory;
  relatedPerson?: string;
  relatedLocation?: string;
  relatedTime?: string;
  contradictionTag?: string;
}

export interface NotebookEntry {
  id: string;
  /** NPC 来源（证词/观察类条目）；物证类条目可为空，使用 sourceLabel 显示 */
  speaker?: NpcId;
  /** 物证类条目的来源标签，如"现场勘查"、"仵作"、"差役报告" */
  sourceLabel?: string;
  day: number;
  period: TimePeriod;
  claims: Claim[];
  rawDialogueSummary: string;
  entryType?: NotebookEntryType;  // 物证/证词/观察（可选，兼容旧条目）
}

export interface NotebookFilter {
  person?: NpcId | null;
  location?: LocationId | null;
  time?: string | null;
  category?: ClaimCategory | null;
  entryType?: NotebookEntryType | null;  // Phase 3 新增筛选维度
}

/** Phase 3: 冲突记录 */
export interface ConflictRecord {
  id: string;
  entryIdA: string;
  entryIdB: string;
  summaryA: string;
  summaryB: string;
  conflictSummary: string;   // 矛盾点摘要
  day: number;
  isHardCoded: boolean;      // 是否来自预设矛盾对
}
