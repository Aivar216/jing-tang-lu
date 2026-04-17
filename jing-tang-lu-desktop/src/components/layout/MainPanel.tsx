import { useGame } from '../../state/GameContext';
import { Day1Tutorial } from '../events/Day1Tutorial';
import { DialoguePanel } from '../dialogue/DialoguePanel';
import { CourtScene } from '../court/CourtScene';
import { DayEndOverlay } from '../events/DayEndOverlay';
import { FinalJudgment } from '../ending/FinalJudgment';
import { InvestigationView } from './InvestigationView';
import './MainPanel.css';

export function MainPanel() {
  const { state } = useGame();

  if (state.gamePhase === 'tutorial') return <Day1Tutorial />;
  if (state.gamePhase === 'court') return <CourtScene />;
  if (state.gamePhase === 'day_end') return <DayEndOverlay />;
  if (state.gamePhase === 'final_judgment') return <FinalJudgment />;

  // investigation phase
  if (state.activeConversationNpc) {
    return <DialoguePanel npcId={state.activeConversationNpc} />;
  }

  return <InvestigationView />;
}
