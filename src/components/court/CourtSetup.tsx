import { useState } from 'react';
import type { NpcId } from '../../types/npc';
import { useCourt } from '../../hooks/useCourt';
import { useGame } from '../../state/GameContext';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { canInitiateCourt, isNpcAvailable } from '../../state/selectors';
import './CourtSetup.css';

interface Props {
  onClose: () => void;
}

export function CourtSetup({ onClose }: Props) {
  const { state } = useGame();
  const { startCourt } = useCourt();
  const [selected, setSelected] = useState<NpcId[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // Bug #14 + Phase 4: 全部 NPC 可上堂，不限于嫌疑人
  const availableNpcs = NPC_DEFINITIONS.filter(
    n => isNpcAvailable(n.id, state) && !state.npcs[n.id].isArrested
  );

  const toggle = (id: NpcId) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 2
        ? [...prev, id]
        : prev
    );
  };

  const handleStartClick = () => {
    if (selected.length < 2) return;
    setShowConfirm(true); // Bug #14: 二次确认
  };

  const handleConfirm = () => {
    startCourt(selected);
    onClose();
  };

  if (!canInitiateCourt(state)) return null;

  return (
    <div className="court-setup-overlay" onClick={onClose}>
      <div className="court-setup-modal" onClick={e => e.stopPropagation()}>
        <div className="court-setup-modal__header">
          <span>升堂对质</span>
          <span className="court-setup-modal__remaining">剩余 {state.courtSessionsRemaining} 次</span>
          <button onClick={onClose}>✕</button>
        </div>

        {showConfirm ? (
          /* 二次确认弹窗 */
          <div className="court-setup-confirm">
            <div className="court-setup-confirm__icon">⚖️</div>
            <div className="court-setup-confirm__text">
              升堂是重大决策，剩余 <strong>{state.courtSessionsRemaining}</strong> 次机会。<br />
              确定传唤
              <strong>「{selected.map(id => NPC_DEFINITIONS.find(n => n.id === id)?.name).join('」与「')}」</strong>
              上堂对质？
            </div>
            <div className="court-setup-confirm__btns">
              <button className="deputy-btn deputy-btn--cancel" onClick={() => setShowConfirm(false)}>再想想</button>
              <button className="deputy-btn deputy-btn--confirm" onClick={handleConfirm}>确定升堂</button>
            </div>
          </div>
        ) : (
          <>
            <div className="court-setup-modal__body">
              <p className="court-setup-modal__hint">
                请选择传唤至公堂的两人（必须选够2人）：
              </p>
              <div className="court-setup-options">
                {availableNpcs.map(n => (
                  <button
                    key={n.id}
                    className={`court-setup-option ${selected.includes(n.id) ? 'court-setup-option--selected' : ''}`}
                    onClick={() => toggle(n.id)}
                    disabled={!selected.includes(n.id) && selected.length >= 2}
                  >
                    <span className="court-setup-option__name">{n.name}</span>
                    <span className="court-setup-option__title">{n.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="court-setup-modal__footer">
              <button className="deputy-btn deputy-btn--cancel" onClick={onClose}>取消</button>
              <button
                className="deputy-btn deputy-btn--confirm"
                onClick={handleStartClick}
                disabled={selected.length < 2}
              >
                {selected.length < 2 ? `还需选 ${2 - selected.length} 人` : '准备升堂'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
