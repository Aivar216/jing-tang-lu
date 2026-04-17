import { GameProvider } from './state/GameContext';
import { MobileAppShell } from './components/layout/MobileAppShell';
import './styles/global.css';

export default function App() {
  return (
    <GameProvider>
      <MobileAppShell />
    </GameProvider>
  );
}
