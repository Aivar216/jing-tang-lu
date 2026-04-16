import { useState } from 'react';
import type { NotebookFilter, NotebookEntryType } from '../../types/notebook';
import type { NpcId } from '../../types/npc';
import { useNotebook } from '../../hooks/useNotebook';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import './NotebookPanel.css';

export function NotebookPanel() {
  const [filter, setFilter] = useState<NotebookFilter>({});
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { filteredEntries, bookmarkedEntries, toggleBookmark, isBookmarked, allEntries } = useNotebook(filter);

  const displayEntries = showBookmarks ? bookmarkedEntries : filteredEntries;

  return (
    <div className="notebook-panel">
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
            value={filter.entryType ?? ''}
            onChange={e => setFilter(f => ({ ...f, entryType: (e.target.value as NotebookEntryType) || null }))}
          >
            <option value="">全部类型</option>
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
              ? '案卷为空。搜查现场或结束问询后，线索将自动录入案卷。'
              : '无符合条件的记录。'}
          </div>
        )}

        {displayEntries.map(entry => {
          const npcDef = entry.speaker ? NPC_DEFINITIONS.find(n => n.id === entry.speaker) : null;
          // 物证条目用 sourceLabel，证词条目用 NPC 名
          const speakerLabel = npcDef?.name ?? entry.sourceLabel ?? entry.speaker ?? '来源不明';
          return (
            <div key={entry.id} className="nb-entry">
              <div className="nb-entry__header">
                <span className="nb-entry__speaker">{speakerLabel}</span>
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

function entryTypeLabel(type: string): string {
  const map: Record<string, string> = {
    testimony: '证词',
    physical: '物证',
    observation: '观察',
  };
  return map[type] ?? type;
}
