import type { NpcId } from '../types/npc';
import type { GameState } from '../types/game';
import type { NotebookEntry } from '../types/notebook';
import { callLLM } from './client';
import { buildNpcSystemPrompt, buildContextAppend, containsForbiddenPhrase } from '../utils/promptBuilder';

export interface NpcMessageOptions {
  isPressure?: boolean;
  citedEntry?: NotebookEntry;
}

export async function sendNpcMessage(
  npcId: NpcId,
  playerMessage: string,
  gameState: GameState,
  options: NpcMessageOptions = {}
): Promise<string> {
  const { isPressure = false, citedEntry } = options;

  const baseSystem = buildNpcSystemPrompt(npcId, gameState);
  const history = gameState.npcs[npcId].conversationHistory;
  const turnCount = Math.floor(history.length / 2) + 1; // 每轮=玩家+NPC各一条
  const pressureCount = (gameState.pressureUsed[npcId] ?? 0) + (isPressure ? 1 : 0);

  const contextAppend = buildContextAppend(isPressure, pressureCount, turnCount, citedEntry);
  const system = baseSystem + contextAppend;

  const messages = [
    ...history,
    { role: 'user' as const, content: playerMessage },
  ];

  let text = await callLLM({ system, messages, maxTokens: 300 });

  if (containsForbiddenPhrase(npcId, text)) {
    text = await callLLM({
      system,
      messages: [
        ...messages,
        { role: 'assistant' as const, content: text },
        { role: 'user' as const, content: '（系统提示：请重新回答，不要涉及超出你角色知识范围的内容。）' },
      ],
      maxTokens: 300,
    });
  }

  return text;
}
