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
    keywordsA: ['陈四', '酉时', '回家'],
    keywordsB: ['王大年', '亥时', '酒馆', '才离开'],
    conflictSummary: '陈四说酉时已回家，王大年称陈四亥时才离开酒馆。',
  },
  {
    id: 'chen_si_time_vs_popo',
    keywordsA: ['陈四', '酉时', '回家'],
    keywordsB: ['孙婆婆', '子时', '才听到', '回来'],
    conflictSummary: '陈四说酉时回家，孙婆婆称子时后才听到有人从周家方向回来。',
  },
  {
    id: 'chen_si_study_vs_zhou_fu',
    keywordsA: ['陈四', '不进', '书房', '不知道', '备用钥匙'],
    keywordsB: ['周福', '陈四', '书房附近', '出没'],
    conflictSummary: '陈四说从不进书房也不知道备用钥匙，周福称曾看到陈四在书房附近出没。',
  },
  {
    id: 'chen_si_study_vs_key_imprint',
    keywordsA: ['陈四', '不进', '书房', '不知道', '备用钥匙'],
    keywordsB: ['抽屉', '钥匙', '凹痕', '钥匙不在', '备用钥匙失踪'],
    conflictSummary: '陈四说不知道备用钥匙，书房抽屉内有钥匙凹痕但钥匙已不在原处。',
  },
  {
    id: 'qin_shi_key_vs_zhou_fu',
    keywordsA: ['秦氏', '钥匙', '只有', '丈夫'],
    keywordsB: ['周福', '备用钥匙', '书房'],
    conflictSummary: '秦氏称钥匙只有丈夫有，周福称书房另有备用钥匙。',
  },
  {
    id: 'qin_shi_self_contradiction',
    keywordsA: ['秦氏', '生意', '不知道', '一无所知'],
    keywordsB: ['秦氏', '不想做了', '密会', '刘万全'],
    conflictSummary: '秦氏说对丈夫生意一无所知，又透露丈夫曾与刘万全密会并说过"不想做了"。',
  },
  {
    id: 'liu_normal_vs_ledger',
    keywordsA: ['刘万全', '普通往来', '普通生意', '正常'],
    keywordsB: ['暗账', '账本', '不明资金', '刘记'],
    conflictSummary: '刘万全称与周伯年只是普通往来，暗账本记录大量不明资金往来收款方为"刘记"。',
  },
  {
    id: 'liu_normal_vs_qin_meetings',
    keywordsA: ['刘万全', '普通往来', '普通生意', '正常'],
    keywordsB: ['秦氏', '密会', '常与刘万全', '不想做了'],
    conflictSummary: '刘万全称与周伯年只是普通往来，秦氏称丈夫常与刘万全密会。',
  },
  {
    id: 'liu_gambling_vs_ma_liu',
    keywordsA: ['刘万全', '赌坊', '无关', '不认识马六'],
    keywordsB: ['马六', '指使', '钱庄那边', '关照陈四'],
    conflictSummary: '刘万全称与赌坊无关，马六称受"钱庄那边的人"指使特意关照陈四。',
  },
  {
    id: 'zhou_fu_alibi_vs_footprints',
    keywordsA: ['周福', '未出门', '没出门', '当晚'],
    keywordsB: ['库房', '两组', '踩踏', '不同时间', '痕迹'],
    conflictSummary: '周福称案发当晚未出门，库房现场存在两组不同时间留下的踩踏痕迹。',
  },
  {
    id: 'ledger_vs_zhou_fu_inventory',
    keywordsA: ['账册', '账本', '库存', '账面'],
    keywordsB: ['周福', '五十斤', '约五十'],
    conflictSummary: '账面库存数字与周福所称库存约五十斤之间存在数量差异。',
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
