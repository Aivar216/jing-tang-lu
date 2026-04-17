import { useRef, useEffect } from 'react';
import { useGame } from '../../state/GameContext';
import type { StoryLogEntry } from '../../types/game';
import './StoryLogPanel.css';

/** 将条目拼成第三人称叙事段落 */
function formatAsProse(entry: StoryLogEntry): string {
  switch (entry.type) {
    case 'narration':
      // 旁白类型（含AI生成的旁白）直接用正文
      if (entry.title.includes('旁白')) return entry.content;
      // 问询类型：title 是 NPC 名
      if (entry.title.startsWith('问询')) {
        const npcName = entry.title.replace('问询', '');
        return `大人传唤${npcName}问话。${entry.content}`;
      }
      // 教程等已有完整叙事的条目，直接用 content
      return entry.content;
    case 'evidence': {
      const evName = entry.title.replace('发现：', '');
      if (entry.content.includes('有所发现')) {
        return entry.content.replace('有所发现', `搜得${evName}。`);
      }
      return `于现场搜得${evName}。${entry.content}`;
    }
    case 'court':
      return entry.content;
    case 'event':
      return entry.content;
    default:
      return entry.content;
  }
}

export function StoryLogPanel() {
  const { state } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.storyLog.length]);

  return (
    <div className="story-log-panel">
      <div className="story-log-panel__entries">
        {state.storyLog.length === 0 && (
          <div className="story-log-panel__empty">
            尚无记录。随着调查推进，重要事件将自动记录于此。
          </div>
        )}

        {state.storyLog.map((entry, idx) => {
          const prev = state.storyLog[idx - 1];
          const showDayHeader = !prev || prev.day !== entry.day;
          return (
            <div key={entry.id}>
              {showDayHeader && (
                <div className="story-log-day-divider">第 {entry.day} 天</div>
              )}
              {entry.type === 'day_change' ? (
                <div className="sl-day-change">{entry.content}</div>
              ) : (
                <p className="sl-prose-entry">{formatAsProse(entry)}</p>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
