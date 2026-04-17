import type { EvidenceId } from '../../types/evidence';

// Evidence items that, when ALL found, trigger layer 2
export const LAYER2_EVIDENCE_TRIGGER: EvidenceId[] = ['ledger_shadow'];

// Day number at which layer 2 triggers automatically regardless of evidence
export const LAYER2_TIME_TRIGGER_DAY = 3;

export const LAYER2_EVENT_TEXT = `第三天清晨，捕快急报：昨夜有人翻墙潜入周宅书房，翻箱倒柜后被巡逻吓跑，未能抓获。书房内留有翻找痕迹，书桌暗格处有被动过的迹象。此人究竟在寻找什么？`;

export const LAYER2_EVIDENCE_TEXT = `书房桌下的暗抽屉被撬开——里面是一本秘密账册。账本密密麻麻记录着大量资金往来，收款方一栏，赫然写着「刘记」，金额远超正常沉香生意所需。周伯年的生意，远比你看到的复杂……`;
