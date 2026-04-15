import { useState, useRef, useCallback } from 'react';
import type { ConflictRecord } from '../../types/notebook';
import { useGame } from '../../state/GameContext';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { detectHardCodedConflict } from '../../data/case/conflictPairs';
import { callLLM } from '../../api/client';
import './ConflictBoard.css';

interface CardPos {
  x: number;
  y: number;
}

interface DragState {
  entryId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

function makeConflictId() {
  return `conflict_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

async function aiJudgeConflict(textA: string, textB: string): Promise<string | null> {
  try {
    const prompt = `以下是两条案件笔记，请判断它们之间是否存在事实性矛盾（时间、地点、行为、物证等直接不一致）。

笔记A：${textA}
笔记B：${textB}

如果存在矛盾，请用一句话（不超过40字）说明矛盾点，输出格式：【矛盾】矛盾描述
如果不存在矛盾，输出：【无矛盾】`;

    const result = await callLLM({
      system: '你是一个严谨的案件分析助手，只判断事实性矛盾，不做推断。',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 80,
    });
    if (result.includes('【矛盾】')) {
      return result.replace('【矛盾】', '').trim();
    }
    return null;
  } catch {
    return null;
  }
}

export function ConflictBoard() {
  const { state, dispatch } = useGame();
  const entries = state.notebookEntries;
  const conflicts = state.conflictRecords;

  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // 卡片位置（初始自动排列）
  const [positions, setPositions] = useState<Record<string, CardPos>>(() => {
    const initial: Record<string, CardPos> = {};
    entries.forEach((e, i) => {
      initial[e.id] = {
        x: 20 + (i % 4) * 200,
        y: 20 + Math.floor(i / 4) * 160,
      };
    });
    return initial;
  });

  const [checking, setChecking] = useState<string | null>(null); // 正在检测的碰撞对

  // 检测两张卡片是否重叠
  const checkOverlap = useCallback((idA: string, idB: string): boolean => {
    const cardA = document.getElementById(`board-card-${idA}`);
    const cardB = document.getElementById(`board-card-${idB}`);
    if (!cardA || !cardB) return false;
    const a = cardA.getBoundingClientRect();
    const b = cardB.getBoundingClientRect();
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }, []);

  // 拖拽结束后检测碰撞
  const handleDragEnd = useCallback(async (movedId: string) => {
    const alreadyConflicted = new Set(
      conflicts.flatMap(c => [c.entryIdA, c.entryIdB])
    );

    for (const other of entries) {
      if (other.id === movedId) continue;
      if (alreadyConflicted.has(movedId) && alreadyConflicted.has(other.id)) continue;

      if (checkOverlap(movedId, other.id)) {
        const movedEntry = entries.find(e => e.id === movedId)!;
        const textA = movedEntry.rawDialogueSummary;
        const textB = other.rawDialogueSummary;

        // 优先硬编码
        const hard = detectHardCodedConflict(textA, textB);
        if (hard) {
          const record: ConflictRecord = {
            id: makeConflictId(),
            entryIdA: movedId,
            entryIdB: other.id,
            summaryA: textA,
            summaryB: textB,
            conflictSummary: hard.conflictSummary,
            day: state.currentDay,
            isHardCoded: true,
          };
          dispatch({ type: 'ADD_CONFLICT_RECORD', record });
          return;
        }

        // AI 判定
        setChecking(`${movedId}|${other.id}`);
        const aiResult = await aiJudgeConflict(textA, textB);
        setChecking(null);

        if (aiResult) {
          const record: ConflictRecord = {
            id: makeConflictId(),
            entryIdA: movedId,
            entryIdB: other.id,
            summaryA: textA,
            summaryB: textB,
            conflictSummary: aiResult,
            day: state.currentDay,
            isHardCoded: false,
          };
          dispatch({ type: 'ADD_CONFLICT_RECORD', record });
        }
        // 无矛盾：静默处理
        break;
      }
    }
  }, [entries, conflicts, checkOverlap, dispatch, state.currentDay]);

  // 鼠标拖拽
  const onMouseDown = useCallback((e: React.MouseEvent, entryId: string) => {
    e.preventDefault();
    const pos = positions[entryId] ?? { x: 0, y: 0 };
    dragRef.current = {
      entryId,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };

    const onMouseMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      setPositions(prev => ({
        ...prev,
        [entryId]: {
          x: Math.max(0, dragRef.current!.origX + dx),
          y: Math.max(0, dragRef.current!.origY + dy),
        },
      }));
    };

    const onMouseUp = () => {
      if (dragRef.current) {
        const id = dragRef.current.entryId;
        dragRef.current = null;
        handleDragEnd(id);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [positions, handleDragEnd]);

  // 计算已有冲突对的 entry IDs
  const conflictedIds = new Set(conflicts.flatMap(c => [c.entryIdA, c.entryIdB]));

  return (
    <div className="conflict-board" ref={boardRef}>
      {checking && (
        <div className="conflict-board__checking">
          <span className="loading-dots">正在判断矛盾</span>
        </div>
      )}

      {/* 冲突连线（SVG） */}
      <svg className="conflict-board__lines" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {conflicts.map(c => {
          const posA = positions[c.entryIdA];
          const posB = positions[c.entryIdB];
          if (!posA || !posB) return null;
          const ax = posA.x + 90;
          const ay = posA.y + 50;
          const bx = posB.x + 90;
          const by = posB.y + 50;
          return (
            <line key={c.id}
              x1={ax} y1={ay} x2={bx} y2={by}
              stroke="#8b1a1a" strokeWidth="2" strokeDasharray="6 3" opacity="0.7"
            />
          );
        })}
      </svg>

      {/* 笔记卡片 */}
      {entries.map(entry => {
        const pos = positions[entry.id] ?? { x: 20, y: 20 };
        const speakerDef = NPC_DEFINITIONS.find(n => n.id === entry.speaker);
        const hasConflict = conflictedIds.has(entry.id);
        return (
          <div
            key={entry.id}
            id={`board-card-${entry.id}`}
            className={`board-card ${hasConflict ? 'board-card--conflict' : ''}`}
            style={{ left: pos.x, top: pos.y }}
            onMouseDown={e => onMouseDown(e, entry.id)}
          >
            <div className="board-card__header">
              <span className="board-card__speaker">{speakerDef?.name ?? entry.speaker}</span>
              <span className="board-card__day">第{entry.day}天</span>
            </div>
            <div className="board-card__content">{entry.rawDialogueSummary}</div>
          </div>
        );
      })}

      {/* 冲突记录卡片 */}
      {conflicts.map((c, i) => (
        <div
          key={c.id}
          className="board-card board-card--conflict-record"
          style={{ left: 20 + i * 210, top: entries.length > 0 ? (Math.ceil(entries.length / 4) * 160 + 40) : 40 }}
        >
          <div className="board-card__header">
            <span className="board-card__conflict-badge">⚡ 矛盾</span>
          </div>
          <div className="board-card__content">{c.conflictSummary}</div>
          <div className="board-card__sources">{c.summaryA.slice(0, 18)}… ↔ {c.summaryB.slice(0, 18)}…</div>
        </div>
      ))}

      {entries.length === 0 && (
        <div className="conflict-board__empty">
          尚无笔记条目。收集对话记录后，将笔记卡片拖拽碰撞以发现矛盾。
        </div>
      )}
    </div>
  );
}
