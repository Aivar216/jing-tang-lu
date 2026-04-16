import type { NpcId, ChatMessage } from '../types/npc';
import type { TimePeriod } from '../types/game';
import type { NotebookEntry, Claim } from '../types/notebook';
import { callLLMExtractor } from './client';
import { NPC_DEFINITIONS } from '../data/case/npcDefinitions';

const EXTRACTION_SYSTEM = `你是一个案件信息记录员，负责将对话中的关键信息整理为案卷条目。

严格规则（违反任何一条均为错误）：
1. 只能记录事实性陈述：谁说了什么、在哪里、什么时间、发现了什么
2. 禁止使用以下词汇及其近义词：破绽、可疑、矛盾、说谎、伪造、异常、蹊跷、嫌疑、指向、暗示
3. 禁止做任何推理、判断、评价或总结性结论
4. 如果NPC的话本身包含判断（如"我觉得他有问题"），原样记录为该NPC的发言，但不要在案卷描述中附和或强化这个判断
5. 记录格式：[来源人物]称/表示/提到 + 事实内容
6. 每条claim的content用第三人称转述，不超过25字
7. 如果对话没有有价值的新信息，返回空数组
8. rawDialogueSummary是对整段对话的一句话事实性概括，格式为"[人名]称[事实]"，不超过30字

输出格式（只输出JSON，不要其他文字）：
{
  "rawDialogueSummary": "一句话概括",
  "claims": [
    {
      "id": "唯一字符串id",
      "content": "转述内容（第三人称，不超过25字）",
      "category": "time | location | person | object | motive",
      "relatedPerson": "相关人名或null",
      "relatedLocation": "相关地点或null",
      "relatedTime": "时间描述如亥时或null",
      "contradictionTag": "内部标签如time_alibi_chen_si或null"
    }
  ]
}`;

export async function extractNotebookEntries(
  dialogue: ChatMessage[],
  npcId: NpcId,
  day: number,
  period: TimePeriod
): Promise<NotebookEntry> {
  const npcDef = NPC_DEFINITIONS.find(n => n.id === npcId);
  const npcName = npcDef?.name ?? npcId;

  const dialogueText = dialogue
    .map(m => `${m.role === 'user' ? '探案官' : npcName}：${m.content}`)
    .join('\n');

  let parsed: { rawDialogueSummary: string; claims: Claim[] } = {
    rawDialogueSummary: `与${npcName}的对话`,
    claims: [],
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = (await callLLMExtractor({
        system: EXTRACTION_SYSTEM,
        messages: [{ role: 'user', content: dialogueText }],
        maxTokens: 800,
      })).trim();
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? null;
      const jsonStr = jsonMatch ? jsonMatch[1] : raw;
      parsed = JSON.parse(jsonStr);
      break;
    } catch {
      // On last attempt, use degraded fallback
      if (attempt === 1) {
        parsed = {
          rawDialogueSummary: `与${npcName}的对话（第${day}天）`,
          claims: [],
        };
      }
    }
  }

  return {
    id: `entry_${npcId}_day${day}_${Date.now()}`,
    speaker: npcId,
    day,
    period,
    entryType: 'testimony' as const,
    claims: parsed.claims ?? [],
    rawDialogueSummary: parsed.rawDialogueSummary ?? `与${npcName}的对话`,
  };
}
