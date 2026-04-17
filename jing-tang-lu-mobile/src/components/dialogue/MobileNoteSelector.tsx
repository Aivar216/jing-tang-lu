import { useEffect } from 'react';
import type { NotebookEntry } from '../../types/notebook';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import './MobileNoteSelector.css';

interface Props {
  entries: NotebookEntry[];
  selectedId: string | undefined;
  onSelect: (entry: NotebookEntry) => void;
  onClose: () => void;
}

export function MobileNoteSelector({ entries, selectedId, onSelect, onClose }: Props) {
  // 弹出时锁定背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="mobile-note-selector-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="选择案卷记录"
    >
      <div
        className="mobile-note-selector-sheet"
        onClick={e => e.stopPropagation()}
      >
        {/* 拖动把手 */}
        <div className="mobile-note-selector-sheet__handle" />

        <div className="mobile-note-selector-sheet__title">
          选择要出示的案卷记录
        </div>

        <div className="mobile-note-selector-sheet__list">
          {entries.length === 0 ? (
            <div className="mobile-note-selector-sheet__empty">
              暂无案卷记录可出示。
              <br />
              问询 NPC 或搜查现场后，线索将录入案卷。
            </div>
          ) : (
            entries.map(entry => {
              const speakerDef = entry.speaker
                ? NPC_DEFINITIONS.find(n => n.id === entry.speaker)
                : null;
              const speakerLabel = speakerDef?.name ?? entry.sourceLabel ?? '物证';
              return (
                <button
                  key={entry.id}
                  className={`mobile-note-option ${selectedId === entry.id ? 'mobile-note-option--selected' : ''}`}
                  onClick={() => { onSelect(entry); }}
                >
                  <span className="mobile-note-option__speaker">[{speakerLabel}]</span>
                  <span className="mobile-note-option__text">{entry.rawDialogueSummary}</span>
                </button>
              );
            })
          )}
        </div>

        <button className="mobile-note-selector-sheet__cancel" onClick={onClose}>
          取消
        </button>
      </div>
    </div>
  );
}
