import { useRef, useEffect } from 'react';
import { useGame } from '../../state/GameContext';
import './StoryLogPanel.css';

export function StoryLogPanel() {
  const { state } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.storyLog.length]);

  return (
    <div className="story-log-panel">
      <div className="story-log-panel__header">
        <span className="story-log-panel__title">剧情记录</span>
        <span className="story-log-panel__count">{state.storyLog.length} 条</span>
      </div>

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
              <div className={`sl-entry sl-entry--${entry.type}`}>
                <div className="sl-entry__icon">{entry.icon}</div>
                <div className="sl-entry__body">
                  <div className="sl-entry__title">{entry.title}</div>
                  <div className="sl-entry__content">{entry.content}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
