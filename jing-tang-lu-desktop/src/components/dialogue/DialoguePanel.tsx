import { useRef, useEffect, useState } from 'react';
import type { NpcId } from '../../types/npc';
import { useDialogue } from '../../hooks/useDialogue';
import { useNotebook } from '../../hooks/useNotebook';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { useGame } from '../../state/GameContext';
import { getNpcTrustLabel } from '../../state/selectors';
import './DialoguePanel.css';

interface Props {
  npcId: NpcId;
}

export function DialoguePanel({ npcId }: Props) {
  const { state } = useGame();
  const {
    history, isLoading, error,
    sendMessage, endConversation,
    isPressureArmed, armPressure, canPressure, pressureUsedCount,
    citedEntry, setCitedEntry,
  } = useDialogue(npcId);
  const { allEntries } = useNotebook();

  const [input, setInput] = useState('');
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const npcDef = NPC_DEFINITIONS.find(n => n.id === npcId);
  const npcState = state.npcs[npcId];

  // 自动结束问询：玩家切换地点/关闭对话时 unmount，自动触发 AI 总结
  const endConversationRef = useRef(endConversation);
  endConversationRef.current = endConversation;
  useEffect(() => {
    return () => { endConversationRef.current(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  // Bug #9: isLoading 结束后自动恢复输入焦点
  const prevIsLoading = useRef(isLoading);
  useEffect(() => {
    if (prevIsLoading.current && !isLoading) {
      inputRef.current?.focus();
    }
    prevIsLoading.current = isLoading;
  }, [isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    setShowNoteSelector(false);
    await sendMessage(trimmed);
    // Bug #9: 发送后焦点保持在输入框
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingPressure = 2 - pressureUsedCount;

  return (
    <div className="dialogue-panel">
      <div className="dialogue-header">
        <div className="dialogue-header__info">
          <span className="dialogue-header__name">{npcDef?.name ?? npcId}</span>
          <span className="dialogue-header__title">{npcDef?.title}</span>
          <span className="dialogue-header__trust tag">
            信任：{getNpcTrustLabel(npcState.trust)}
          </span>
        </div>
        <button className="dialogue-header__close" onClick={endConversation}>
          结束问询
        </button>
      </div>

      <div className="dialogue-messages">
        {history.length === 0 && (
          <div className="dialogue-messages__empty">
            <p>大人可向{npcDef?.name}问询任何事项。</p>
            <p className="hint">可使用下方「施压」按钮逼问，或「出示记录」将证据摆到对方面前。</p>
          </div>
        )}

        {history.map((msg, i) => (
          <div
            key={i}
            className={`message-bubble message-bubble--${msg.role === 'user' ? 'player' : 'npc'}`}
          >
            <div className="message-bubble__speaker">
              {msg.role === 'user' ? '大人' : npcDef?.name}
            </div>
            <div className="message-bubble__content">{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="message-bubble message-bubble--npc message-bubble--loading">
            <div className="message-bubble__speaker">{npcDef?.name}</div>
            <div className="message-bubble__content loading-dots">思量中</div>
          </div>
        )}

        {error && (
          <div className="dialogue-error">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 笔记选择浮层 */}
      {showNoteSelector && (
        <div className="dialogue-note-selector">
          <div className="dialogue-note-selector__title">选择要出示的案卷记录：</div>
          {allEntries.length === 0 ? (
            <div className="dialogue-note-selector__empty">暂无案卷记录可出示</div>
          ) : (
            <div className="dialogue-note-selector__list">
              {allEntries.map(entry => {
                const speakerDef = entry.speaker ? NPC_DEFINITIONS.find(n => n.id === entry.speaker) : null;
                const speakerLabel = speakerDef?.name ?? entry.sourceLabel ?? '物证';
                return (
                  <button
                    key={entry.id}
                    className={`note-option ${citedEntry?.id === entry.id ? 'note-option--selected' : ''}`}
                    onClick={() => { setCitedEntry(entry); setShowNoteSelector(false); }}
                  >
                    <span className="note-option__speaker">[{speakerLabel}]</span>
                    {entry.rawDialogueSummary}
                  </button>
                );
              })}
            </div>
          )}
          <button className="dialogue-note-selector__close" onClick={() => setShowNoteSelector(false)}>
            取消
          </button>
        </div>
      )}

      {/* 操作栏 */}
      <div className="dialogue-actions">
        <button
          className={`dialogue-action-btn dialogue-action-btn--pressure ${isPressureArmed ? 'dialogue-action-btn--armed' : ''} ${!canPressure ? 'dialogue-action-btn--exhausted' : ''}`}
          onClick={armPressure}
          disabled={!canPressure}
          title={canPressure ? (isPressureArmed ? '取消施压' : '下次发言将以官威施压') : '该 NPC 已无法再被施压'}
        >
          {canPressure
            ? (isPressureArmed ? `⚡ 施压中（剩余${remainingPressure - 1}次）` : `⚡ 施压（剩余${remainingPressure}次）`)
            : '🔒 已无法施压'}
        </button>

        <button
          className={`dialogue-action-btn dialogue-action-btn--note ${citedEntry ? 'dialogue-action-btn--has-note' : ''}`}
          onClick={() => setShowNoteSelector(s => !s)}
        >
          {citedEntry ? '📋 已选记录 ✓' : '📋 出示记录'}
        </button>
      </div>

      {/* 出示记录 — 浮动卡片 */}
      {citedEntry && (
        <div className="dialogue-cited-card">
          <div className="dialogue-cited-card__label">出示</div>
          <div className="dialogue-cited-card__content">「{citedEntry.rawDialogueSummary}」</div>
          <button className="dialogue-cited-card__remove" onClick={() => setCitedEntry(null)}>✕</button>
        </div>
      )}

      <div className="dialogue-input">
        <textarea
          ref={inputRef}
          className="dialogue-input__textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="向对方提问……（Enter 发送，Shift+Enter 换行）"
          disabled={isLoading}
          rows={2}
        />
        <button
          className="dialogue-input__send"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          问
        </button>
      </div>
    </div>
  );
}
