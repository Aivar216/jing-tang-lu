import type { NpcId } from '../types/npc';
import type { GameState } from '../types/game';
import type { NotebookEntry } from '../types/notebook';
import { NPC_PROMPTS } from '../data/case/npcPrompts';
import { getNpcTrustLabel } from '../state/selectors';

export function buildNpcSystemPrompt(npcId: NpcId, state: GameState): string {
  const staticPrompt = NPC_PROMPTS[npcId];
  const npcState = state.npcs[npcId];

  const dynamicContext = `

## 当前游戏状态（仅供你参考，不要直接说出来）
- 今天是第 ${state.currentDay} 天，${periodLabel(state.currentPeriod)}
- 探案官对你的信任评估：${getNpcTrustLabel(npcState.trust)}（${npcState.trust}/100）
- 你之前已透露的信息标签：${npcState.revealedFactIds.length > 0 ? npcState.revealedFactIds.join('、') : '无'}
- 探案官已公开掌握的证据：${state.evidenceFound.length > 0 ? state.evidenceFound.join('、') : '无'}
- 第二层真相是否已被揭露：${state.layer2Triggered ? '是（镇上已发生夜闯书房事件）' : '否'}
- 探案官的可信度评分：${state.credibilityScore}/100${state.credibilityScore < 60 ? '（探案官已有错误指控，镇民对他评价下降）' : ''}
${buildNpcSpecificFlags(npcId, npcState.flags)}`;

  return staticPrompt + dynamicContext;
}

/**
 * 构建本轮对话的附加指令（追加在 system prompt 末尾）
 * - isPressure: 本次施压
 * - pressureCount: 该 NPC 累计被施压次数（含本次）
 * - turnCount: 本次是第几轮对话
 * - citedEntry: 玩家出示的笔记条目（可选）
 */
export function buildContextAppend(
  isPressure: boolean,
  pressureCount: number,
  turnCount: number,
  citedEntry?: NotebookEntry
): string {
  const parts: string[] = [];

  // 施压指令
  if (isPressure) {
    parts.push(
      `[系统：玩家正以官威向你施压。这是第 ${pressureCount} 次施压（上限2次）。` +
      `你感受到很大的压力。根据你的性格和当前信任度来决定反应——` +
      `你可以选择松口透露一些隐瞒的信息，也可以选择硬顶回去，但反应要剧烈明显，不能像平时一样平淡回答。` +
      `${pressureCount >= 2 ? '这是最后一次施压，你已做出最终表态，之后不再受施压影响。' : ''}]`
    );
  }

  // 出示笔记指令（加强版：要求有意义的回应）
  if (citedEntry) {
    const typeLabel = (citedEntry as { entryType?: string }).entryType === 'physical' ? '物证'
      : (citedEntry as { entryType?: string }).entryType === 'observation' ? '观察记录'
      : '证词';
    parts.push(
      `[系统：玩家向你出示了一条${typeLabel}：「${citedEntry.rawDialogueSummary}」。` +
      `你必须对这条信息做出有意义的回应——可以质疑来源、补充细节、表现出情绪波动、或者承认某些事实。` +
      `绝对不能说"我不知道"、"这与我无关"、"我不清楚"然后就结束。` +
      `即使这条信息表面上与你无关，你也应该基于你所知道的情况给出评论或反应。]`
    );
  }

  // 对话轮次指令
  if (turnCount <= 2) {
    // 初期：鼓励配合，主动提供基础信息
    parts.push(
      `[系统：这是第 ${turnCount} 轮对话，对话刚开始。` +
      `你应该表现得比较配合，主动提供你知道的基础事实（时间、地点、你在做什么等）。` +
      `不要一问三不知或刻意回避——那太不自然了，反而显得可疑。]`
    );
  } else if (turnCount >= 6) {
    const msg = turnCount >= 8
      ? `这是第 ${turnCount} 轮对话，你已经明确没有更多想说的内容，每次回答都应是变着花样的拒绝或敷衍。`
      : `这是第 ${turnCount} 轮对话，你开始出现没有更多可说的迹象，回答应变短变敷衍。`;
    const override = citedEntry ? '但本轮玩家出示了新信息，你可以重新活跃起来正常回答。' : '';
    parts.push(`[系统：${msg}${override}]`);
  } else if (turnCount >= 4) {
    // 中期：开始略显不耐烦
    parts.push(
      `[系统：这是第 ${turnCount} 轮对话，你开始有些不耐烦，回答可以稍微简短一些，但仍然要提供有意义的内容。]`
    );
  } else {
    parts.push(`[系统：这是第 ${turnCount} 轮对话，正常回应即可。]`);
  }

  return parts.length > 0 ? '\n\n' + parts.join('\n') : '';
}

function periodLabel(period: string): string {
  switch (period) {
    case 'morning': return '上午';
    case 'afternoon': return '下午';
    case 'evening': return '傍晚';
    default: return period;
  }
}

function buildNpcSpecificFlags(npcId: NpcId, flags: Record<string, boolean>): string {
  const lines: string[] = [];
  if (npcId === 'liu_wanquan' && flags['alerted']) {
    lines.push('- 重要：你已察觉探案官在调查你，处于高度警觉状态，应找借口回避或转移话题');
  }
  if (npcId === 'chen_si' && flags['has_confessed_warehouse']) {
    lines.push('- 你已经承认进过库房，无需再否认这一点');
  }
  if (npcId === 'chen_si' && flags['has_confessed_manslaughter']) {
    lines.push('- 你已经承认推倒了掌柜，现在处于崩溃认罪状态');
  }
  if (npcId === 'ma_liu' && flags['has_betrayed_liu']) {
    lines.push('- 你已经出卖了刘万全，此时处于配合状态');
  }
  return lines.join('\n');
}

// Forbidden phrases per NPC that should not appear in responses
export const FORBIDDEN_PHRASES: Partial<Record<NpcId, string[]>> = {
  chen_si: ['私盐', '走私', '刘万全让我', '官盐', '盐引'],
  qin_shi: ['私盐生意', '刘万全的货'],
  liu_wanquan: ['陈四是我让', '马六替我'],
  song_wuzuo: ['凶手是', '我认为是'],
  li_mingde: ['凶手是', '真相是'],
};

export function containsForbiddenPhrase(npcId: NpcId, text: string): boolean {
  const phrases = FORBIDDEN_PHRASES[npcId];
  if (!phrases) return false;
  return phrases.some(phrase => text.includes(phrase));
}
