import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { evaluateFinalJudgment, ENDING_TEXTS, ALL_ENDINGS } from '../../utils/endingJudge';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import './EndingScreen.css';

export function EndingScreen() {
  const { state } = useGame();
  const [showStoryLog, setShowStoryLog] = useState(false);

  const killerAccusation = state.accusationsMade
    .filter(a => a.context === 'final_judgment')
    .find(a => a.accusedNpcId !== 'liu_wanquan') ?? state.accusationsMade.find(a => a.context === 'final_judgment');

  const mastermindAccusation = state.accusationsMade
    .filter(a => a.context === 'final_judgment')
    .find(a => a.accusedNpcId === 'liu_wanquan');

  if (!killerAccusation) {
    return (
      <div className="ending-screen">
        <div className="ending-screen__card">
          <div className="ending-screen__title">游戏结束</div>
          <p>案件未能告破。</p>
        </div>
      </div>
    );
  }

  const result = evaluateFinalJudgment(
    killerAccusation.accusedNpcId,
    mastermindAccusation?.accusedNpcId ?? null,
    state
  );

  const texts = ENDING_TEXTS[result.ending];
  const killerDef = NPC_DEFINITIONS.find(n => n.id === killerAccusation.accusedNpcId);
  const mastermindDef = mastermindAccusation
    ? NPC_DEFINITIONS.find(n => n.id === mastermindAccusation.accusedNpcId)
    : null;

  if (showStoryLog) {
    return (
      <div className="ending-screen">
        <div className="ending-screen__card ending-screen__card--log">
          <div className="ending-screen__log-header">
            <button className="ending-log__back" onClick={() => setShowStoryLog(false)}>← 返回结局</button>
            <div className="ending-screen__title">探案记录</div>
          </div>
          <div className="ending-log__entries">
            {state.storyLog.length === 0 ? (
              <div className="ending-log__empty">暂无记录。</div>
            ) : (
              state.storyLog.map(entry => (
                <div key={entry.id} className={`ending-log__entry ending-log__entry--${entry.type}`}>
                  <div className="ending-log__entry-header">
                    <span>{entry.icon}</span>
                    <span className="ending-log__entry-title">{entry.title}</span>
                    <span className="ending-log__entry-day">第{entry.day}天</span>
                  </div>
                  <div className="ending-log__entry-content">{entry.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ending-screen">
      <div className="ending-screen__card">
        {/* 结局标识 */}
        <div className={`ending-screen__badge ending-screen__badge--${result.ending}`}>
          <span className="ending-screen__badge-sub">{texts.subtitle}</span>
          <span className="ending-screen__badge-title">「{texts.title}」</span>
        </div>

        {/* 裁断摘要 */}
        <div className="ending-screen__body">
          <p className="ending-screen__verdict">
            大人宣判：<strong>{killerDef?.name}</strong>为凶手
            {mastermindDef && <>，<strong>{mastermindDef.name}</strong>为幕后主使</>}。
          </p>
          <p className="ending-screen__narrative">{texts.body}</p>
        </div>

        {/* 统计 */}
        <div className="ending-screen__stats">
          <div className="stat-item">
            <span className="stat-item__label">最终声望</span>
            <span className="stat-item__value">{state.credibilityScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__label">调查天数</span>
            <span className="stat-item__value">{state.currentDay} 天</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__label">掌握证据</span>
            <span className="stat-item__value">{state.evidenceFound.length} 项</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__label">错误指控</span>
            <span className="stat-item__value">{state.accusationsMade.filter(a => !a.wasCorrect).length} 次</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__label">发现矛盾</span>
            <span className="stat-item__value">{state.conflictRecords.length} 处</span>
          </div>
        </div>

        {/* 真相揭示 */}
        <div className="ending-screen__true-story">
          <div className="ending-screen__true-story-label">——真相——</div>
          <div className="ending-screen__true-story-text">{texts.trueStory}</div>
          {texts.hint && (
            <div className="ending-screen__hint">{texts.hint}</div>
          )}
        </div>

        {/* 4种结局一览 */}
        <div className="ending-screen__all-endings">
          <div className="ending-screen__all-endings-label">本案共有 4 种结局</div>
          <div className="ending-screen__endings-row">
            {ALL_ENDINGS.map(e => (
              <div
                key={e.type}
                className={`ending-chip ending-chip--${e.type} ${result.ending === e.type ? 'ending-chip--achieved' : ''}`}
              >
                <span className="ending-chip__sub">{e.subtitle}</span>
                <span className="ending-chip__title">「{e.title}」</span>
                {result.ending === e.type && <span className="ending-chip__star">✦</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="ending-screen__actions">
          <button className="ending-btn ending-btn--log" onClick={() => setShowStoryLog(true)}>
            📜 查看探案记录
          </button>
        </div>
      </div>
    </div>
  );
}
