import { GameProvider } from './state/GameContext';
import { AppShell } from './components/layout/AppShell';
import './styles/global.css';

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
