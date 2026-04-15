import { useState, useCallback } from 'react';
import type { NpcId } from '../types/npc';
import type { NotebookEntry } from '../types/notebook';
import { useGame } from '../state/GameContext';
import { sendNpcMessage } from '../api/npcAgent';
import { extractNotebookEntries } from '../api/notebookExtractor';

export function useDialogue(npcId: NpcId) {
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 2: 施压和出示笔记状态
  const [isPressureArmed, setIsPressureArmed] = useState(false); // 下次发送是否施压
  const [citedEntry, setCitedEntry] = useState<NotebookEntry | null>(null);

  const pressureUsedCount = state.pressureUsed[npcId] ?? 0;
  const canPressure = pressureUsedCount < 2;

  const armPressure = useCallback(() => {
    if (!canPressure) return;
    setIsPressureArmed(p => !p);
  }, [canPressure]);

  const sendMessage = useCallback(
    async (playerMessage: string) => {
      if (isLoading || !playerMessage.trim()) return;
      setIsLoading(true);
      setError(null);

      const isPressure = isPressureArmed;
      const cited = citedEntry;

      // 立即重置施压和引用状态
      setIsPressureArmed(false);
      setCitedEntry(null);

      try {
        // 若施压，先记录使用次数
        if (isPressure) {
          dispatch({ type: 'USE_PRESSURE', npcId });
        }

        const npcResponse = await sendNpcMessage(npcId, playerMessage, state, {
          isPressure,
          citedEntry: cited ?? undefined,
        });

        dispatch({
          type: 'SEND_MESSAGE',
          npcId,
          playerMessage,
          npcResponse,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '与NPC通信失败，请重试。');
      } finally {
        setIsLoading(false);
      }
    },
    [npcId, state, dispatch, isLoading, isPressureArmed, citedEntry]
  );

  const endConversation = useCallback(() => {
    const history = state.npcs[npcId].conversationHistory;
    // Bug #12: 先立即关闭对话（非阻塞），再异步提取笔记
    dispatch({ type: 'END_CONVERSATION', npcId, entry: null });

    if (history.length === 0) return;

    // 去重检查：若该 NPC 今天已有笔记且内容相似则跳过（Bug #11）
    const todayEntries = state.notebookEntries.filter(
      e => e.speaker === npcId && e.day === state.currentDay
    );

    extractNotebookEntries(history, npcId, state.currentDay, state.currentPeriod)
      .then(entry => {
        // Bug #11: 去重 — 若摘要相同则不重复录入
        const isDuplicate = todayEntries.some(
          e => e.rawDialogueSummary === entry.rawDialogueSummary
        );
        if (!isDuplicate) {
          dispatch({ type: 'ADD_NOTEBOOK_ENTRY', entry });
        }
      })
      .catch(() => { /* 提取失败静默处理 */ });
  }, [npcId, state, dispatch]);

  const history = state.npcs[npcId].conversationHistory;

  return {
    history,
    isLoading,
    error,
    sendMessage,
    endConversation,
    // Phase 2 新增
    isPressureArmed,
    armPressure,
    canPressure,
    pressureUsedCount,
    citedEntry,
    setCitedEntry,
  };
}
