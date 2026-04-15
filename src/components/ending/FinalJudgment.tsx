import { useState } from 'react';
import type { NpcId } from '../../types/npc';
import { useGame } from '../../state/GameContext';
import { evaluateFinalJudgment } from '../../utils/endingJudge';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import './FinalJudgment.css';

type Step = 'killer' | 'mastermind_yn' | 'mastermind_select' | 'confirm';

export function FinalJudgment() {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState<Step>('killer');
  const [killer, setKiller] = useState<NpcId | ''>('');
  const [hasMastermind, setHasMastermind] = useState<boolean | null>(null);
  const [mastermind, setMastermind] = useState<NpcId | ''>('');
  const [confirmed, setConfirmed] = useState(false);

  const allNpcs = NPC_DEFINITIONS;
  const killerOptions = allNpcs.filter(n => !state.npcs[n.id]?.isArrested);
  const mastermindOptions = allNpcs.filter(n => n.id !== killer && !state.npcs[n.id]?.isArrested);

  const handleSubmit = () => {
    if (!killer) return;
    setConfirmed(true);

    const effectiveMastermind = hasMastermind && mastermind ? mastermind : null;
    const result = evaluateFinalJudgment(killer, effectiveMastermind, state);

    dispatch({
      type: 'MAKE_ACCUSATION',
      accusation: {
        day: state.currentDay,
        accusedNpcId: killer,
        context: 'final_judgment',
        wasCorrect: result.killerCorrect,
      },
    });

    if (effectiveMastermind) {
      dispatch({
        type: 'MAKE_ACCUSATION',
        accusation: {
          day: state.currentDay,
          accusedNpcId: effectiveMastermind as NpcId,
          context: 'final_judgment',
          wasCorrect: result.mastermindCorrect,
        },
      });
    }

    setTimeout(() => {
      dispatch({ type: 'SET_PHASE', phase: 'ended' });
    }, 600);
  };

  if (confirmed) {
    return (
      <div className="final-judgment">
        <div className="final-judgment__card">
          <div className="final-judgment__title">判决已定</div>
          <div className="final-judgment__wait">正在核查真相……</div>
        </div>
      </div>
    );
  }

  const killerName = NPC_DEFINITIONS.find(n => n.id === killer)?.name;
  const mastermindName = NPC_DEFINITIONS.find(n => n.id === mastermind)?.name;

  return (
    <div className="final-judgment">
      <div className="final-judgment__card">
        <div className="final-judgment__day">第 {state.currentDay} 天 · 最终判决</div>
        <div className="final-judgment__title">大人，请做出最终裁断</div>

        {/* 步骤指示器 */}
        <div className="final-judgment__steps">
          <span className={`fj-step ${step === 'killer' ? 'fj-step--active' : killer ? 'fj-step--done' : ''}`}>① 认定凶手</span>
          <span className="fj-step-sep">→</span>
          <span className={`fj-step ${step === 'mastermind_yn' || step === 'mastermind_select' ? 'fj-step--active' : hasMastermind !== null ? 'fj-step--done' : ''}`}>② 幕后主谋</span>
          <span className="fj-step-sep">→</span>
          <span className={`fj-step ${step === 'confirm' ? 'fj-step--active' : ''}`}>③ 确认宣判</span>
        </div>

        {/* 步骤一：选凶手 */}
        {step === 'killer' && (
          <div className="final-judgment__section">
            <label className="final-judgment__label">直接导致周伯年死亡之人</label>
            <div className="final-judgment__options">
              {killerOptions.map(s => (
                <button
                  key={s.id}
                  className={`judgment-option ${killer === s.id ? 'judgment-option--selected' : ''}`}
                  onClick={() => setKiller(s.id)}
                >
                  <span className="judgment-option__name">{s.name}</span>
                  <span className="judgment-option__title">{s.title}</span>
                </button>
              ))}
            </div>
            <button
              className="final-judgment__next"
              onClick={() => setStep('mastermind_yn')}
              disabled={!killer}
            >
              下一步：认定幕后主谋 →
            </button>
          </div>
        )}

        {/* 步骤二：是否有幕后主谋 */}
        {step === 'mastermind_yn' && (
          <div className="final-judgment__section">
            <div className="final-judgment__killer-summary">
              凶手认定：<strong>{killerName}</strong>
            </div>
            <label className="final-judgment__label">大人认为此案是否另有幕后主使？</label>
            <div className="final-judgment__yn-btns">
              <button
                className={`fj-yn-btn ${hasMastermind === true ? 'fj-yn-btn--selected' : ''}`}
                onClick={() => { setHasMastermind(true); setStep('mastermind_select'); }}
              >
                是，另有主谋
              </button>
              <button
                className={`fj-yn-btn ${hasMastermind === false ? 'fj-yn-btn--selected' : ''}`}
                onClick={() => { setHasMastermind(false); setMastermind(''); setStep('confirm'); }}
              >
                否，就是意外
              </button>
            </div>
            <button className="final-judgment__back" onClick={() => setStep('killer')}>← 修改凶手</button>
          </div>
        )}

        {/* 步骤三：选幕后主谋 */}
        {step === 'mastermind_select' && (
          <div className="final-judgment__section">
            <div className="final-judgment__killer-summary">
              凶手认定：<strong>{killerName}</strong>
            </div>
            <label className="final-judgment__label">幕后主使之人</label>
            <div className="final-judgment__options">
              {mastermindOptions.map(s => (
                <button
                  key={s.id}
                  className={`judgment-option ${mastermind === s.id ? 'judgment-option--selected' : ''}`}
                  onClick={() => setMastermind(s.id)}
                >
                  <span className="judgment-option__name">{s.name}</span>
                  <span className="judgment-option__title">{s.title}</span>
                </button>
              ))}
            </div>
            <div className="final-judgment__nav-row">
              <button className="final-judgment__back" onClick={() => setStep('mastermind_yn')}>← 返回</button>
              <button
                className="final-judgment__next"
                onClick={() => setStep('confirm')}
                disabled={!mastermind}
              >
                下一步：确认宣判 →
              </button>
            </div>
          </div>
        )}

        {/* 步骤四：确认 */}
        {step === 'confirm' && (
          <div className="final-judgment__section">
            <label className="final-judgment__label">最终裁断确认</label>
            <div className="final-judgment__summary-box">
              <div className="fj-summary-row">
                <span className="fj-summary-label">凶手</span>
                <span className="fj-summary-value">{killerName}</span>
              </div>
              <div className="fj-summary-row">
                <span className="fj-summary-label">幕后主谋</span>
                <span className="fj-summary-value">{hasMastermind && mastermindName ? mastermindName : '无（意外事件）'}</span>
              </div>
            </div>
            <p className="final-judgment__warn">宣判后不可撤回，请大人慎重。</p>
            <div className="final-judgment__nav-row">
              <button className="final-judgment__back" onClick={() => setStep(hasMastermind ? 'mastermind_select' : 'mastermind_yn')}>← 修改</button>
              <button className="final-judgment__submit" onClick={handleSubmit}>
                击鼓宣判
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
