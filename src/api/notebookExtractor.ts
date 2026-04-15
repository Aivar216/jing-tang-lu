import type { NpcId, ChatMessage } from '../types/npc';
import type { TimePeriod } from '../types/game';
import type { NotebookEntry, Claim } from '../types/notebook';
import { callLLMExtractor } from './client';
import { NPC_DEFINITIONS } from '../data/case/npcDefinitions';

const EXTRACTION_SYSTEM = `你是一个案件信息记录员。你的任务是从一段对话记录中提取关键陈述，以JSON格式输出。

规则：
1. 只提取说话人明确表达的主张或信息，不做任何推断或分析
2. 不标注矛盾，不评估可信度，不做任何判断
3. contradictionTag字段仅供系统内部使用，玩家绝对看不到此字段
4. 每条claim的content用第三人称转述，不超过25字
5. 如果对话没有有价值的新信息，返回空数组
6. rawDialogueSummary是对整段对话的一句话概括，不超过30字

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
