import { useGame } from '../../state/GameContext';
import { useDayAdvance } from '../../hooks/useDayAdvance';
import { LAYER2_EVENT_TEXT, LAYER2_EVIDENCE_TEXT } from '../../data/events/layer2Triggers';
import { getEvidence, EVIDENCE_DEFINITIONS } from '../../data/case/evidenceDefinitions';
import './DayEndOverlay.css';

export function DayEndOverlay() {
  const { state } = useGame();
  const { confirmDayStart } = useDayAdvance();

  const showLayer2Event =
    state.layer2Triggered &&
    state.layer2TriggerMethod === 'time' &&
    !state.evidenceFound.includes('ledger_shadow');

  const showLayer2Evidence =
    state.layer2Triggered &&
    state.layer2TriggerMethod === 'evidence';

  const hasDeputyResult = state.deputyResultPending !== null;

  // 断案令剩余天数（currentDay 已是新天，所以刚结束的是 currentDay-1 天）
  const remainingDays = 6 - (state.currentDay - 1);
  const isLastDay = remainingDays <= 1;

  // 今日探访的 NPC 数（visitedNpcIds 在 START_CONVERSATION 时累积）
  const visitedToday = Object.values(state.npcs)
    .filter(npc => npc.conversationHistory.length > 0).length;

  return (
    <div className="day-end-overlay">
      <div className="day-end-card">
        {/* ADVANCE_DAY 已执行，currentDay 已是新的一天，需要减1显示刚结束的天数 */}
        <div className="day-end-card__title">第 {state.currentDay - 1} 天 · 日终</div>

        {/* 断案令提示 */}
        <div className={`day-end-deadline ${isLastDay ? 'day-end-deadline--urgent' : ''}`}>
          {isLastDay
            ? '明日即是断案令最后期限！'
            : `断案令剩余 ${remainingDays} 天`}
        </div>

        {hasDeputyResult && state.deputyResultPending && (
          <div className="day-end-section">
            <div className="day-end-section__label">捕快回报</div>
            <div className="day-end-section__content">
              {state.deputyResultPending.report || '捕快带回了些许线索，但情报有限，未有关键发现。'}
            </div>
            {state.deputyResultPending.evidenceUnlocked && (
              <div className="day-end-section__evidence-tag tag tag--gold">
                新线索已录入案卷：{getEvidence(state.deputyResultPending.evidenceUnlocked)?.title ?? state.deputyResultPending.evidenceUnlocked}
              </div>
            )}
          </div>
        )}

        {showLayer2Event && (
          <div className="day-end-section day-end-section--alert">
            <div className="day-end-section__label">紧急事件</div>
            <div className="day-end-section__content">{LAYER2_EVENT_TEXT}</div>
          </div>
        )}

        {showLayer2Evidence && (
          <div className="day-end-section day-end-section--alert">
            <div className="day-end-section__label">重要发现</div>
            <div className="day-end-section__content">{LAYER2_EVIDENCE_TEXT}</div>
          </div>
        )}

        {/* ── 今日成果 ── */}
        <div className="day-end-section day-end-section--summary">
          <div className="day-end-section__label">今日成果</div>
          <div className="day-end-summary-grid">
            <div className="day-end-summary-item">
              <span className="day-end-summary-item__value">{state.evidenceFoundToday}</span>
              <span className="day-end-summary-item__label">新线索</span>
            </div>
            <div className="day-end-summary-item">
              <span className="day-end-summary-item__value">{visitedToday}</span>
              <span className="day-end-summary-item__label">证人问询</span>
            </div>
            <div className="day-end-summary-item">
              <span className="day-end-summary-item__value">{state.notebookEntries.length}</span>
              <span className="day-end-summary-item__label">案卷记录</span>
            </div>
          </div>
        </div>

        <div className="day-end-card__status">
          <span>剩余升堂：{state.courtSessionsRemaining} 次</span>
          <span>声望：{state.credibilityScore}</span>
          <span>证据 {state.evidenceFound.length}/{EVIDENCE_DEFINITIONS.length}</span>
        </div>

        <button className="day-end-card__btn" onClick={confirmDayStart}>
          {/* currentDay 已是新天，>= 6 说明完成了第5天，下一步是最终判决 */}
          {state.currentDay >= 6 ? '进入最终判决' : `迎接第 ${state.currentDay} 天`}
        </button>
      </div>
    </div>
  );
}
