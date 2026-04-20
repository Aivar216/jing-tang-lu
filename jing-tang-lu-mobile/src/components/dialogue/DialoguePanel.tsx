import { useRef, useEffect, useState } from 'react';
import type { NpcId } from '../../types/npc';
import { useDialogue } from '../../hooks/useDialogue';
import { useNotebook } from '../../hooks/useNotebook';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { useGame } from '../../state/GameContext';
import { getNpcTrustLabel } from '../../state/selectors';
import { MobileNoteSelector } from './MobileNoteSelector';
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

  // 自动结束问询：切换地点等导致组件卸载时自动触发 AI 总结
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
      {/* 头部：NPC 信息 + 结束按钮 */}
      <div className="dialogue-header">
        <div className="dialogue-header__info">
          <span className="dialogue-header__name">{npcDef?.name ?? npcId}</span>
          <span className="dialogue-header__title">{npcDef?.title}</span>
          <span className="dialogue-header__trust tag">
            信任：{getNpcTrustLabel(npcState.trust)}
          </span>
        </div>
        <button className="dialogue-header__close" onClick={endConversation}>
          结束
        </button>
      </div>

      {/* 消息列表 */}
      <div className="dialogue-messages">
        {history.length === 0 && (
          <div className="dialogue-messages__empty">
            <p>大人可向{npcDef?.name}问询任何事项。</p>
            <p className="hint">使用下方「施压」逼问，或「出示」将案卷证据摆到对方面前。</p>
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

      {/* 已选案卷记录内联展示（非绝对定位，随输入区移动）*/}
      {citedEntry && (
        <div className="dialogue-cited-inline">
          <span className="dialogue-cited-inline__label">📋 出示</span>
          <span className="dialogue-cited-inline__content">
            「{citedEntry.rawDialogueSummary}」
          </span>
          <button
            className="dialogue-cited-inline__remove"
            onClick={() => setCitedEntry(null)}
            aria-label="取消出示"
          >
            ✕
          </button>
        </div>
      )}

      {/* 操作栏（施压 + 出示记录）*/}
      <div className="dialogue-actions">
        <button
          className={`dialogue-action-btn dialogue-action-btn--pressure ${isPressureArmed ? 'dialogue-action-btn--armed' : ''} ${!canPressure ? 'dialogue-action-btn--exhausted' : ''}`}
          onClick={armPressure}
          disabled={!canPressure}
        >
          {canPressure
            ? (isPressureArmed ? `⚡施压中（余${remainingPressure - 1}）` : `⚡施压（余${remainingPressure}）`)
            : '🔒 无法施压'}
        </button>

        <button
          className={`dialogue-action-btn dialogue-action-btn--note ${citedEntry ? 'dialogue-action-btn--has-note' : ''}`}
          onClick={() => setShowNoteSelector(s => !s)}
        >
          {citedEntry ? '📋 已选 ✓' : '📋 出示'}
        </button>
      </div>

      {/* 输入区 */}
      <div className="dialogue-input">
        <textarea
          ref={inputRef}
          className="dialogue-input__textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="向对方提问……"
          disabled={isLoading}
          rows={1}
        />
        <button
          className="dialogue-input__send"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          问
        </button>
      </div>

      {/* 全屏笔记选择器（固定弹窗，不受虚拟键盘影响）*/}
      {showNoteSelector && (
        <MobileNoteSelector
          entries={allEntries}
          selectedId={citedEntry?.id}
          onSelect={entry => { setCitedEntry(entry); setShowNoteSelector(false); }}
          onClose={() => setShowNoteSelector(false)}
        />
      )}
    </div>
  );
}
