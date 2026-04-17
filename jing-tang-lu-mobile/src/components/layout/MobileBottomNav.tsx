import { useGame } from '../../state/GameContext';
import './MobileBottomNav.css';

export type MobileTab = 'map' | 'investigation' | 'notebook' | 'storylog';

interface Props {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const TABS: { id: MobileTab; icon: string; label: string }[] = [
  { id: 'map',           icon: '🗺',  label: '地图' },
  { id: 'investigation', icon: '⚔',  label: '调查' },
  { id: 'notebook',      icon: '📋', label: '案卷' },
  { id: 'storylog',      icon: '📖', label: '剧情' },
];

export function MobileBottomNav({ activeTab, onTabChange }: Props) {
  const { state } = useGame();

  const notebookCount = state.notebookEntries.length;
  const storyCount    = state.storyLog.length;

  return (
    <nav className="mobile-bottom-nav">
      {TABS.map(tab => {
        const badge =
          tab.id === 'notebook' ? notebookCount :
          tab.id === 'storylog' ? storyCount    : 0;

        return (
          <button
            key={tab.id}
            className={`mobile-bottom-nav__tab ${activeTab === tab.id ? 'mobile-bottom-nav__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
          >
            <span className="mobile-bottom-nav__icon">{tab.icon}</span>
            <span className="mobile-bottom-nav__label">{tab.label}</span>
            {badge > 0 && (
              <span className="mobile-bottom-nav__badge">{badge > 99 ? '99+' : badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
