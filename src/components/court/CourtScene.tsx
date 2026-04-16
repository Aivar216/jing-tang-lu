import { useState, useRef } from 'react';
import type { NpcId } from '../../types/npc';
import type { Verdict } from '../../types/court';
import { useCourt } from '../../hooks/useCourt';
import { useGame } from '../../state/GameContext';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { useNotebook } from '../../hooks/useNotebook';
import './CourtScene.css';

export function CourtScene() {
  const { activeSession, isLoading, error, addPlayerTurn, renderVerdict, isForcedConclusion, turnsRemaining, courtMaxTurns } = useCourt();
  const { state } = useGame();
  const { allEntries } = useNotebook();
  const [input, setInput] = useState('');
  const [citedEntryId, setCitedEntryId] = useState<string | undefined>();
  const [showEvidenceSelector, setShowEvidenceSelector] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  if (!activeSession) return null;

  // Bug #5: 通过 entryId 查找完整 entry 以显示原文
  const citedEntry = citedEntryId
    ? allEntries.find(e => e.id === citedEntryId)
    : undefined;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await addPlayerTurn(activeSession.id, input.trim(), citedEntryId);
    setInput('');
    setCitedEntryId(undefined);
    setShowEvidenceSelector(false);
    inputRef.current?.focus();
  };

  const handleVerdict = (verdict: Verdict, arrestedNpcId?: NpcId) => {
    renderVerdict(activeSession.id, verdict, arrestedNpcId);
  };

  // 显示所有笔记（不限于收藏）供引用
  const allNotebookEntries = allEntries;

  return (
    <div className="court-scene">
      <div className="court-scene__header">
        <div className="court-scene__title">升堂问案</div>
        <div className="court-scene__participants">
          {activeSession.participants.map(npcId => {
            const def = NPC_DEFINITIONS.find(n => n.id === npcId);
            const isArrested = state.npcs[npcId]?.isArrested;
            return (
              <span key={npcId} className="court-participant">
                {def?.name ?? npcId}
                {isArrested && <span className="tag tag--red" style={{ marginLeft: 4 }}>收押</span>}
              </span>
            );
          })}
        </div>
        <div className={`court-scene__turns-left ${turnsRemaining <= 1 ? 'court-scene__turns-left--low' : ''}`}>
          剩余追问 {turnsRemaining}/{courtMaxTurns}
        </div>
      </div>

      <div className="court-scene__turns">
        {activeSession.turns.length === 0 && (
          <div className="court-scene__opening">
            「{activeSession.participants.map(id => NPC_DEFINITIONS.find(n => n.id === id)?.name).join('」「')}」已传至公堂，大人可开始问询。
          </div>
        )}

        {activeSession.turns.map((turn, i) => {
          const actorName = turn.actor === 'player' ? '大人'
            : turn.actor === 'narrator' ? ''
            : NPC_DEFINITIONS.find(n => n.id === turn.actor)?.name ?? turn.actor;
          // Bug #5: 显示引用笔记的原文而非 entry ID
          const citedEntryForTurn = turn.citedEntryId
            ? allEntries.find(e => e.id === turn.citedEntryId)
            : undefined;
          return (
            <div key={i} className={`court-turn court-turn--${turn.actor === 'player' ? 'player' : turn.actor === 'narrator' ? 'narrator' : 'npc'}`}>
              {turn.actor !== 'narrator' && (
                <div className="court-turn__speaker">{actorName}</div>
              )}
              <div className="court-turn__content">{turn.content}</div>
              {citedEntryForTurn && (
                <div className="court-turn__evidence">
                  📋 引用：「{citedEntryForTurn.rawDialogueSummary}」
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="court-turn court-turn--loading">
            <span className="loading-dots">公堂对质中</span>
          </div>
        )}

        {error && <div className="court-error">{error}</div>}
      </div>

      {isForcedConclusion ? (
        <div className="court-verdict">
          <div className="court-verdict__prompt">双方陈词已毕，请大人做出定断：</div>
          <div className="court-verdict__btns">
            {activeSession.participants.map(npcId => {
              const def = NPC_DEFINITIONS.find(n => n.id === npcId);
              return (
                <button
                  key={npcId}
                  className="verdict-btn verdict-btn--arrest"
                  onClick={() => handleVerdict('arrest', npcId)}
                >
                  收押 {def?.name}
                </button>
              );
            })}
            <button
              className="verdict-btn verdict-btn--release"
              onClick={() => handleVerdict('release')}
            >
              证据不足，暂时释放
            </button>
          </div>
        </div>
      ) : (
        <div className="court-input">
          {showEvidenceSelector && (
            <div className="court-evidence-selector">
              <div className="court-evidence-selector__title">选择引用案卷记录（点击选中）：</div>
              {allNotebookEntries.length === 0 ? (
                <div className="court-evidence-selector__empty">暂无案卷记录可引用</div>
              ) : (
                allNotebookEntries.map(entry => {
                  const npcDef = entry.speaker ? NPC_DEFINITIONS.find(n => n.id === entry.speaker) : null;
                  const speakerLabel = npcDef?.name ?? entry.sourceLabel ?? '物证';
                  return (
                    <button
                      key={entry.id}
                      className={`evidence-option ${citedEntryId === entry.id ? 'evidence-option--selected' : ''}`}
                      onClick={() => { setCitedEntryId(entry.id); setShowEvidenceSelector(false); }}
                    >
                      <span className="evidence-option__speaker">[{speakerLabel}]</span>
                      {/* Bug #5: 显示完整原文 */}
                      {entry.rawDialogueSummary}
                    </button>
                  );
                })
              )}
              <button className="court-evidence-selector__close" onClick={() => setShowEvidenceSelector(false)}>取消</button>
            </div>
          )}

          <div className="court-input__row">
            {citedEntry && (
              <div className="court-input__cited">
                📋 引用：「{citedEntry.rawDialogueSummary}」
                <button onClick={() => setCitedEntryId(undefined)}>✕</button>
              </div>
            )}
            <button className="court-input__evidence-btn" onClick={() => setShowEvidenceSelector(s => !s)}>
              引用记录
            </button>
            <textarea
              ref={inputRef}
              className="court-input__textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="向堂上发问……（Enter 发送）"
              disabled={isLoading}
              rows={2}
            />
            <button className="court-input__send" onClick={handleSend} disabled={isLoading || !input.trim()}>
              问
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
