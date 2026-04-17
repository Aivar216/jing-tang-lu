import type { NpcId } from './npc';
import type { LocationId } from './game';
import type { EvidenceId } from './evidence';

export type DeputyTaskType = 'surveillance' | 'search' | 'inquiry';

export interface DeputyTask {
  id: string;
  dayDispatched: number;
  type: DeputyTaskType;
  targetNpcId?: NpcId;
  targetLocationId?: LocationId;
  instruction: string;
  /** 预设任务定义ID（用于查找固定报告文本） */
  taskDefId?: string;
  /** 预设报告文本（直接存储，避免reducer依赖外部数据） */
  presetReport?: string;
  /** 预设任务可能解锁的证据 */
  presetEvidence?: EvidenceId;
}

export interface DeputyResult {
  taskId: string;
  dayReturned: number;
  report: string;
  evidenceUnlocked?: EvidenceId;
}
