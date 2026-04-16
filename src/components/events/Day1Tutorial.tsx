import { useGame } from '../../state/GameContext';
import { DAY1_TUTORIAL } from '../../data/events/day1Tutorial';
import type { StoryLogEntry } from '../../types/game';
import './Day1Tutorial.css';

function makeLogId() { return `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

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
      // Tutorial 完成：将师爷开场白录入剧情录
      DAY1_TUTORIAL.forEach(t => {
        const entry: StoryLogEntry = {
          id: makeLogId(),
          day: 1,
          type: 'narration',
          icon: '📖',
          title: t.speaker === '旁白' ? '旁白' : t.speaker,
          content: t.summary || t.text,
        };
        dispatch({ type: 'ADD_STORY_LOG', entry });
      });

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
