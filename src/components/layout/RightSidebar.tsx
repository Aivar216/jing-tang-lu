import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { NotebookPanel } from '../notebook/NotebookPanel';
import { StoryLogPanel } from '../storylog/StoryLogPanel';
import './RightSidebar.css';

type SidebarTab = 'log' | 'notebook';

export function RightSidebar() {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>('log');

  const logCount = state.storyLog.length;
  const notebookCount = state.notebookEntries.length;

  return (
    <div className={`right-sidebar ${isOpen ? 'right-sidebar--open' : 'right-sidebar--closed'}`}>
      <button
        className="right-sidebar__toggle"
        onClick={() => setIsOpen(o => !o)}
        title={isOpen ? '收起侧栏' : '展开侧栏'}
      >
        {isOpen ? '▶' : '◀'}
        <span className="right-sidebar__toggle-label">{isOpen ? '' : '记'}</span>
      </button>

      {isOpen && (
        <div className="right-sidebar__content">
          <div className="right-sidebar__tabs">
            <button
              className={`rs-tab ${activeTab === 'log' ? 'rs-tab--active' : ''}`}
              onClick={() => setActiveTab('log')}
            >
              剧情 {logCount > 0 ? `(${logCount})` : ''}
            </button>
            <button
              className={`rs-tab ${activeTab === 'notebook' ? 'rs-tab--active' : ''}`}
              onClick={() => setActiveTab('notebook')}
            >
              案卷 {notebookCount > 0 ? `(${notebookCount})` : ''}
            </button>
          </div>

          <div className="right-sidebar__panel">
            {activeTab === 'log' ? <StoryLogPanel /> : <NotebookPanel />}
          </div>
        </div>
      )}
    </div>
  );
}
