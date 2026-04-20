import type { NpcId } from '../types/npc';
import type { GameState } from '../types/game';
import type { CourtTurn } from '../types/court';
import { callLLM } from './client';
import { NPC_DEFINITIONS } from '../data/case/npcDefinitions';
import { buildNpcSystemPrompt } from '../utils/promptBuilder';

export async function generateCourtResponse(
  speakingNpcId: NpcId,
  listeningNpcId: NpcId,
  lastTurn: CourtTurn,
  allTurns: CourtTurn[],
  gameState: GameState
): Promise<string> {
  const systemPrompt = buildNpcSystemPrompt(speakingNpcId, gameState);
  const listeningName = NPC_DEFINITIONS.find(n => n.id === listeningNpcId)?.name ?? listeningNpcId;
  const speakingName = NPC_DEFINITIONS.find(n => n.id === speakingNpcId)?.name ?? speakingNpcId;

  const previousContext = allTurns
    .slice(-4)
    .map(t => {
      if (t.actor === 'player') return `探案官：${t.content}`;
      if (t.actor === 'narrator') return `（旁白）${t.content}`;
      const name = NPC_DEFINITIONS.find(n => n.id === t.actor)?.name ?? t.actor;
      return `${name}：${t.content}`;
    })
    .join('\n');

  let lastSpeakerText = '';
  if (lastTurn.actor === 'player') {
    lastSpeakerText = `探案官刚才说：「${lastTurn.content}」`;
  } else if (lastTurn.actor !== 'narrator') {
    const lastName = NPC_DEFINITIONS.find(n => n.id === lastTurn.actor)?.name ?? lastTurn.actor;
    lastSpeakerText = `${lastName}刚才说：「${lastTurn.content}」`;
  }

  const courtInstruction = `\n\n## 当前场景：升堂对质\n你现在在县衙公堂上接受审问。${listeningName}也在堂上。\n${lastSpeakerText}\n\n之前的庭审对话：\n${previousContext}\n\n请以${speakingName}的身份回应，控制在2-3句话。你在公堂上，言行会影响你的处境。`;

  return callLLM({
    system: systemPrompt + courtInstruction,
    messages: [{ role: 'user', content: `（公堂上）${lastSpeakerText || '大人请你陈述案情。'}` }],
    maxTokens: 250,
  });
}

export function buildCourtNarratorClosing(): string {
  return '李明德躬身道：「大人，双方各执一词，是否作出定断？」';
}

export const COURT_MAX_TURNS = 3;
export const MAX_NPC_EXCHANGES = 1;  // 最多 1 轮 NPC 互动，避免对话堆积重复

export function shouldForceConclude(turnCount: number): boolean {
  return turnCount >= COURT_MAX_TURNS;
}

/**
 * 生成 NPC 对另一个 NPC 发言的回应
 * 返回空字符串表示该 NPC 选择沉默，不回应
 */
export async function generateNpcExchange(
  speakingNpcId: NpcId,
  listeningNpcId: NpcId,
  lastNpcTurn: CourtTurn,
  allTurns: CourtTurn[],
  gameState: GameState
): Promise<string> {
  const systemPrompt = buildNpcSystemPrompt(speakingNpcId, gameState);
  const listeningName = NPC_DEFINITIONS.find(n => n.id === listeningNpcId)?.name ?? listeningNpcId;
  const speakingName = NPC_DEFINITIONS.find(n => n.id === speakingNpcId)?.name ?? speakingNpcId;

  const previousContext = allTurns
    .slice(-6)
    .map(t => {
      if (t.actor === 'player') return `探案官：${t.content}`;
      if (t.actor === 'narrator') return `（旁白）${t.content}`;
      const name = NPC_DEFINITIONS.find(n => n.id === t.actor)?.name ?? t.actor;
      return `${name}：${t.content}`;
    })
    .join('\n');

  const exchangeInstruction = `\n\n## 当前场景：升堂对质（你与${listeningName}的对质环节）\n${listeningName}刚才说：「${lastNpcTurn.content}」\n\n之前的庭审对话：\n${previousContext}\n\n请以${speakingName}的身份决定是否回应${listeningName}：\n- 如果你觉得${listeningName}说的不对、有隐瞒、你想反驳或补充，就直接说，控制在1-2句话。\n- 如果你对${listeningName}刚才的话没有意见、觉得没什么好回应的，请直接返回"（沉默）"。\n你在公堂上，言行会影响你的处境。`;

  const response = await callLLM({
    system: systemPrompt + exchangeInstruction,
    messages: [{ role: 'user', content: `（公堂上）${listeningName}刚说完话，你怎么看？` }],
    maxTokens: 200,
  });

  // 检测沉默：空、过短、或明确返回"（沉默）"
  const trimmed = response.trim();
  if (trimmed === '（沉默）' || trimmed === '' || trimmed.length < 4) {
    return '';
  }
  return response;
}
