import { useGame } from '../../state/GameContext';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MainPanel } from './MainPanel';
import { EndingScreen } from '../ending/EndingScreen';
import './AppShell.css';

export function AppShell() {
  const { state } = useGame();

  if (state.gamePhase === 'ended') {
    return <EndingScreen />;
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-shell__body">
        <LeftSidebar />
        <MainPanel />
        <RightSidebar />
      </div>
    </div>
  );
}
