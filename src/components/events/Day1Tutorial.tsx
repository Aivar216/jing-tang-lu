import { useGame } from '../../state/GameContext';
import { DAY1_TUTORIAL } from '../../data/events/day1Tutorial';
import './Day1Tutorial.css';

export function Day1Tutorial() {
  const { state, dispatch } = useGame();
  const step = state.tutorialStep;
  const current = DAY1_TUTORIAL[step];

  const handleNext = () => {
    if (step < DAY1_TUTORIAL.length - 1) {
      dispatch({ type: 'ADVANCE_TUTORIAL' });
      if (DAY1_TUTORIAL[step + 1]?.action === 'move_to_warehouse') {
        dispatch({ type: 'MOVE_TO_LOCATION', locationId: 'warehouse_scene' });
      }
    } else {
      // Tutorial complete, enter free investigation
      dispatch({ type: 'MOVE_TO_LOCATION', locationId: 'warehouse_scene' });
      dispatch({ type: 'SET_PHASE', phase: 'investigation' });
    }
  };

  if (!current) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-card__day">第一天 · 案发</div>

        <div className="tutorial-card__speaker">{current.speaker}</div>

        <div className="tutorial-card__text">{current.text}</div>

        <button className="tutorial-card__btn" onClick={handleNext}>
          {step < DAY1_TUTORIAL.length - 1 ? '继续 →' : '开始调查'}
        </button>
      </div>
    </div>
  );
}
