import { callLLMExtractor } from './client';

const NARRATOR_SYSTEM = `你是一位古风悬疑小说的旁白叙述者。你的任务是根据当日发生的事件，生成2-3句文学性旁白。

风格要求：
- 古典悬疑氛围，文字优美但不晦涩
- 侧重感受与气氛，而非事实罗列
- 不要直接剧透结论，引导玩家继续思考
- 长度：50-80字之间

输出格式：只输出旁白文字，不要其他内容。`;

export async function generateDayNarration(
  day: number,
  dayEvents: string[]
): Promise<string> {
  if (dayEvents.length === 0) {
    return `第${day}天的调查在一片沉默中落幕。线索散落，真相如水中月，触手可及，却总差一步之遥。`;
  }

  const eventsText = dayEvents.slice(-5).join('；');
  const prompt = `第${day}天的调查结束。今日要点：${eventsText}。\n请生成旁白。`;

  try {
    const result = await callLLMExtractor({
      system: NARRATOR_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 120,
    });
    return result.trim() || defaultNarration(day);
  } catch {
    return defaultNarration(day);
  }
}

function defaultNarration(day: number): string {
  const narrations = [
    '夜色如墨，清河镇归于寂静。大人独坐案前，那些若隐若现的线索，像碎帛一样散落在思绪里……',
    '灯火阑珊处，真相的轮廓模糊而诱人。每一句证词都藏着半真半假，大人需要更锋利的目光。',
    '案情渐渐清晰，却又生出新的疑云。这桩沉香命案，牵扯的不只是一个人的秘密。',
    '时日紧迫。大人手中的每一条线索，都将在最后的裁决中显出它的重量。',
    '真相从不会自动浮出水面——它需要被人一点一点地逼出来。',
  ];
  return narrations[(day - 1) % narrations.length];
}
