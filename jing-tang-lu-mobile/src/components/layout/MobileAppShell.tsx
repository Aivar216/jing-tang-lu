import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { MainPanel } from './MainPanel';
import { NotebookPanel } from '../notebook/NotebookPanel';
import { StoryLogPanel } from '../storylog/StoryLogPanel';
import { EndingScreen } from '../ending/EndingScreen';
import { MobileBottomNav, type MobileTab } from './MobileBottomNav';
import './MobileAppShell.css';

export function MobileAppShell() {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<MobileTab>('investigation');

  // 游戏进入特定阶段时强制显示「调查」标签，隐藏底部导航
  const forcedInvestigation =
    state.gamePhase === 'tutorial' ||
    state.gamePhase === 'court' ||
    state.gamePhase === 'day_end' ||
    state.gamePhase === 'final_judgment' ||
    state.activeConversationNpc !== null;

  const hideNav = forcedInvestigation;
  const effectiveTab: MobileTab = forcedInvestigation ? 'investigation' : activeTab;

  // 游戏结束单独渲染结局页
  if (state.gamePhase === 'ended') {
    return <EndingScreen />;
  }

  return (
    <div className="mobile-app-shell">
      <TopBar />

      <div className="mobile-app-shell__body">
        {/* 所有标签面板始终挂载，用 display:none 切换以保留滚动位置 */}
        <div
          className="mobile-tab-panel"
          style={{ display: effectiveTab === 'investigation' ? 'flex' : 'none' }}
        >
          {/* 地图（地点/NPC选择）+ 调查内容合并为一个面板，上下布局 */}
          <div className="mobile-inv-layout">
            <div className="mobile-inv-layout__sidebar">
              <LeftSidebar />
            </div>
            <div className="mobile-inv-layout__main">
              <MainPanel />
            </div>
          </div>
        </div>

        <div
          className="mobile-tab-panel"
          style={{ display: effectiveTab === 'notebook' ? 'flex' : 'none' }}
        >
          <NotebookPanel />
        </div>

        <div
          className="mobile-tab-panel"
          style={{ display: effectiveTab === 'storylog' ? 'flex' : 'none' }}
        >
          <StoryLogPanel />
        </div>
      </div>

      {!hideNav && (
        <MobileBottomNav
          activeTab={effectiveTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
}
