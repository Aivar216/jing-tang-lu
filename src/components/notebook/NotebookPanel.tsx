import { useState } from 'react';
import type { NotebookFilter, NotebookEntryType } from '../../types/notebook';
import type { NpcId } from '../../types/npc';
import { useNotebook } from '../../hooks/useNotebook';
import { useGame } from '../../state/GameContext';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { ConflictBoard } from './ConflictBoard';
import './NotebookPanel.css';

export function NotebookPanel() {
  const { state } = useGame();
  const [filter, setFilter] = useState<NotebookFilter>({});
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showConflictBoard, setShowConflictBoard] = useState(false);
  const { filteredEntries, bookmarkedEntries, toggleBookmark, isBookmarked, allEntries } = useNotebook(filter);

  const displayEntries = showBookmarks ? bookmarkedEntries : filteredEntries;
  const conflictCount = state.conflictRecords.length;

  if (showConflictBoard) {
    return (
      <div className="notebook-panel">
        <div className="notebook-panel__header">
          <span className="notebook-panel__title">案情板</span>
          <button
            className="nb-tab nb-tab--active"
            onClick={() => setShowConflictBoard(false)}
          >
            ← 返回笔记
          </button>
        </div>
        <div className="notebook-panel__board-hint">
          拖拽两张卡片相互碰撞，自动检测矛盾并连线标记。
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <ConflictBoard />
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-panel">
      <div className="notebook-panel__header">
        <span className="notebook-panel__title">案件笔记</span>
        <span className="notebook-panel__count">{allEntries.length} 条</span>
      </div>

      <div className="notebook-panel__tabs">
        <button
          className={`nb-tab ${!showBookmarks ? 'nb-tab--active' : ''}`}
          onClick={() => setShowBookmarks(false)}
        >
          全部
        </button>
        <button
          className={`nb-tab ${showBookmarks ? 'nb-tab--active' : ''}`}
          onClick={() => setShowBookmarks(true)}
        >
          ★ 标记 ({bookmarkedEntries.length})
        </button>
        <button
          className={`nb-tab nb-tab--board ${conflictCount > 0 ? 'nb-tab--board-active' : ''}`}
          onClick={() => setShowConflictBoard(true)}
        >
          ⚡ 案情板{conflictCount > 0 ? ` (${conflictCount})` : ''}
        </button>
      </div>

      {!showBookmarks && (
        <div className="notebook-panel__filters">
          <select
            className="nb-filter-select"
            value={filter.person ?? ''}
            onChange={e => setFilter(f => ({ ...f, person: (e.target.value as NpcId) || null }))}
          >
            <option value="">全部人物</option>
            {NPC_DEFINITIONS.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>

          <select
            className="nb-filter-select"
            value={filter.category ?? ''}
            onChange={e => setFilter(f => ({ ...f, category: e.target.value as never || null }))}
          >
            <option value="">全部类别</option>
            <option value="time">时间</option>
            <option value="location">地点</option>
            <option value="person">人物</option>
            <option value="object">物证</option>
            <option value="motive">动机</option>
          </select>

          <select
            className="nb-filter-select"
            value={filter.entryType ?? ''}
            onChange={e => setFilter(f => ({ ...f, entryType: (e.target.value as NotebookEntryType) || null }))}
          >
            <option value="">全部来源</option>
            <option value="testimony">证词</option>
            <option value="physical">物证</option>
            <option value="observation">观察</option>
          </select>
        </div>
      )}

      <div className="notebook-panel__entries">
        {displayEntries.length === 0 && (
          <div className="notebook-panel__empty">
            {allEntries.length === 0
              ? '尚无记录。结束与NPC的对话后，关键陈述将自动记录于此。'
              : '无符合条件的记录。'}
          </div>
        )}

        {displayEntries.map(entry => {
          const npcDef = NPC_DEFINITIONS.find(n => n.id === entry.speaker);
          return (
            <div key={entry.id} className="nb-entry">
              <div className="nb-entry__header">
                <span className="nb-entry__speaker">{npcDef?.name ?? entry.speaker}</span>
                <span className="nb-entry__meta">第{entry.day}天 · {periodLabel(entry.period)}</span>
                {entry.entryType && (
                  <span className={`nb-entry__type nb-entry__type--${entry.entryType}`}>
                    {entryTypeLabel(entry.entryType)}
                  </span>
                )}
                <button
                  className={`nb-entry__bookmark ${isBookmarked(entry.id) ? 'nb-entry__bookmark--active' : ''}`}
                  onClick={() => toggleBookmark(entry.id)}
                  title={isBookmarked(entry.id) ? '取消标记' : '标记此条'}
                >
                  {isBookmarked(entry.id) ? '★' : '☆'}
                </button>
              </div>
              <div className="nb-entry__summary">{entry.rawDialogueSummary}</div>
              {entry.claims.length > 0 && (
                <div className="nb-entry__claims">
                  {entry.claims.map(claim => (
                    <div key={claim.id} className="nb-claim">
                      <span className={`tag nb-claim__cat nb-claim__cat--${claim.category}`}>
                        {categoryLabel(claim.category)}
                      </span>
                      <span className="nb-claim__content">{claim.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function periodLabel(period: string): string {
  if (period === 'morning') return '上午';
  if (period === 'afternoon') return '下午';
  return '傍晚';
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    time: '时间', location: '地点', person: '人物', object: '物证', motive: '动机',
  };
  return map[cat] ?? cat;
}

function entryTypeLabel(type: string): string {
  const map: Record<string, string> = {
    testimony: '证词',
    physical: '物证',
    observation: '观察',
  };
  return map[type] ?? type;
}
