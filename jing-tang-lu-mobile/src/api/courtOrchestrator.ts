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

export function shouldForceConclude(turnCount: number): boolean {
  return turnCount >= COURT_MAX_TURNS;
}
