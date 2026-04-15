import type { EvidenceId } from '../../types/evidence';

// Evidence items that, when ALL found, trigger layer 2
export const LAYER2_EVIDENCE_TRIGGER: EvidenceId[] = ['ledger_shadow'];

// Day number at which layer 2 triggers automatically regardless of evidence
export const LAYER2_TIME_TRIGGER_DAY = 3;

export const LAYER2_EVENT_TEXT = `第五天清晨，捕快急报：昨夜有人翻墙潜入周宅书房，翻箱倒柜后被巡逻吓跑，未能抓获。房间内留有打斗痕迹，但书房夹层似乎有人动过。

此事颇为蹊跷——周伯年已死，究竟是什么人冒险夜闯书房？他们在找什么？

这场案子，远比你最初想象的要复杂……`;

export const LAYER2_EVIDENCE_TEXT = `书房夹层中，你发现了一本秘密账册。账本上密密麻麻记录着大量与"官盐"名义不符的私盐货款——收款方一栏，赫然写着「刘记」。

周伯年不只是沉香商人。这门生意背后，藏着更深的秘密……`;
