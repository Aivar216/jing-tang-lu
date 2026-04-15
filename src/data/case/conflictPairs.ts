/**
 * 预设核心矛盾对
 * 每对矛盾通过关键词宽松匹配 NotebookEntry.rawDialogueSummary 或 claims[].content
 */
export interface HardCodedConflict {
  id: string;
  keywordsA: string[];   // 第一条笔记的匹配关键词（OR 关系，任一命中即可）
  keywordsB: string[];   // 第二条笔记的匹配关键词
  conflictSummary: string;
}

export const HARD_CODED_CONFLICTS: HardCodedConflict[] = [
  {
    id: 'chen_si_time_vs_wang',
    keywordsA: ['陈四', '酉时', '回家', '离开'],
    keywordsB: ['王大年', '亥时', '酒馆', '才走'],
    conflictSummary: '陈四称酉时便已回家，但王大年证实他亥时仍在酒馆——时间前后矛盾。',
  },
  {
    id: 'chen_si_time_vs_popo',
    keywordsA: ['陈四', '酉时', '回家'],
    keywordsB: ['孙婆婆', '子时', '脚步', '回来'],
    conflictSummary: '陈四称酉时回家，孙婆婆却说子时后才听到有人从周家方向归来，脚步与陈四相符。',
  },
  {
    id: 'chen_si_warehouse_vs_zhou_fu',
    keywordsA: ['陈四', '不进', '库房', '从不'],
    keywordsB: ['周福', '陈四', '书房附近', '鬼鬼祟祟'],
    conflictSummary: '陈四声称从不进库房，但周福曾见其在书房附近鬼鬼祟祟。',
  },
  {
    id: 'key_qin_vs_zhou',
    keywordsA: ['秦氏', '钥匙', '只有', '丈夫'],
    keywordsB: ['周福', '备用钥匙', '书房'],
    conflictSummary: '秦氏说钥匙只有亡夫有，但周福知道书房另有备用钥匙——有人在说谎。',
  },
  {
    id: 'inventory_zhou_vs_ledger',
    keywordsA: ['周福', '库存', '五十斤', '五十'],
    keywordsB: ['账册', '账本', '八十斤', '八十'],
    conflictSummary: '周福称库存约五十斤，而账本记录为八十斤——三十斤沉香下落不明。',
  },
  {
    id: 'liu_vs_qin_meetings',
    keywordsA: ['刘万全', '普通往来', '正常', '普通生意'],
    keywordsB: ['秦氏', '密会', '密谈', '收手', '想退出'],
    conflictSummary: '刘万全声称与周伯年只是普通生意往来，而秦氏透露丈夫常与他深夜密会，且曾想"收手"。',
  },
  {
    id: 'liu_vs_ma_liu',
    keywordsA: ['刘万全', '赌坊', '无关', '不认识马六'],
    keywordsB: ['马六', '指使', '钱庄', '让我', '照顾陈四'],
    conflictSummary: '刘万全否认与赌坊有关联，但马六承认是"钱庄那边的人"让他特别关照陈四。',
  },
  {
    id: 'lock_vs_intruder_claim',
    keywordsA: ['撬痕', '内侧', '内部', '从里面'],
    keywordsB: ['外人', '闯入', '贼', '外贼'],
    conflictSummary: '仵作确认撬痕从内侧制造，与"外人闯入"的说法正面矛盾——门锁系内部伪造。',
  },
];

/**
 * 检测两条 rawDialogueSummary 是否命中某一预设矛盾对
 * 返回命中的矛盾对，或 null
 */
export function detectHardCodedConflict(
  textA: string,
  textB: string
): HardCodedConflict | null {
  const lower = (s: string) => s.toLowerCase();
  const matchesAny = (text: string, keywords: string[]) =>
    keywords.some(kw => lower(text).includes(lower(kw)));

  for (const conflict of HARD_CODED_CONFLICTS) {
    const aMatchesA = matchesAny(textA, conflict.keywordsA);
    const aMatchesB = matchesAny(textA, conflict.keywordsB);
    const bMatchesA = matchesAny(textB, conflict.keywordsA);
    const bMatchesB = matchesAny(textB, conflict.keywordsB);

    // 正向：A命中keywordsA且B命中keywordsB，或反向
    if ((aMatchesA && bMatchesB) || (aMatchesB && bMatchesA)) {
      return conflict;
    }
  }
  return null;
}
