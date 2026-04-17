import type { GameState } from '../types/game';
import type { EvidenceId } from '../types/evidence';

export type EndingType = 'perfect' | 'insight' | 'basic' | 'failure';

// The correct answers
const CORRECT_KILLER = 'chen_si';
const CORRECT_MASTERMIND = 'liu_wanquan';

// Key evidence that proves Liu Wanquan's mastermind role
const MASTERMIND_KEY_EVIDENCE: EvidenceId[] = [
  'ledger_shadow',        // E12 书房暗账本
  'ma_liu_instigated',    // E13 马六受人指使
  'zhou_liu_secret_meetings', // E11 周伯年与刘万全密会
];

export interface FinalJudgmentResult {
  killerCorrect: boolean;
  mastermindCorrect: boolean;
  mastermindEvidenceCount: number;
  ending: EndingType;
}

export function evaluateFinalJudgment(
  accusedKillerId: string,
  accusedMastermindId: string | null,
  state: GameState
): FinalJudgmentResult {
  const killerCorrect = accusedKillerId === CORRECT_KILLER;
  const mastermindCorrect = accusedMastermindId === CORRECT_MASTERMIND;

  const mastermindEvidenceCount = MASTERMIND_KEY_EVIDENCE.filter(id =>
    state.evidenceFound.includes(id)
  ).length;

  let ending: EndingType;
  if (!killerCorrect) {
    ending = 'failure';
  } else if (killerCorrect && mastermindCorrect && mastermindEvidenceCount >= 2) {
    ending = 'perfect';
  } else if (killerCorrect && mastermindCorrect && mastermindEvidenceCount < 2) {
    ending = 'insight';
  } else {
    // killerCorrect but mastermind wrong or not selected
    ending = 'basic';
  }

  return { killerCorrect, mastermindCorrect, mastermindEvidenceCount, ending };
}

export const ENDING_TEXTS: Record<EndingType, {
  title: string;
  subtitle: string;
  body: string;
  trueStory: string;
  hint: string;
}> = {
  perfect: {
    title: '真相大白',
    subtitle: '完美结局',
    body: '你不仅查明了周伯年的死因，更揭开了隐藏在沉香生意背后的私盐走私大案。陈四以过失杀人罪论处，刘万全的走私链条被彻底查明，马六等人一并受到惩处。清河镇的百姓无不称颂大人明察秋毫。',
    trueStory: '周伯年的死是一场意外：伙计陈四为偿赌债深夜盗取沉香，被主人撞见，慌乱中推倒周伯年，撞上石阶身亡。但在这场意外的背后，是刘万全精心布局的私盐走私网络——他利用马六的赌坊控制陈四，以周伯年的沉香生意为掩护，清洗私盐货款长达七年。周伯年之死，切断了这条黑色产业链最重要的一环。',
    hint: '',
  },
  insight: {
    title: '心知肚明',
    subtitle: '洞察结局',
    body: '你准确地指出了凶手与幕后主使，但手中的证据尚不足以对刘万全形成完整的指控链。陈四以过失杀人罪收押，刘万全因证据不足只得暂时释放。你心中清楚，那条走私网络仍在暗处运转……',
    trueStory: '你已触及真相的全貌，却未能握住将其彻底拉向阳光的那根绳索。书房暗账本、马六受人指使、周伯年与刘万全密会——这三项关键证据中至少还缺一条，才能让刘万全无处遁形。',
    hint: '提示：需同时掌握书房暗账本、马六受人指使、周伯年与刘万全密会中的至少两项，才能达成「真相大白」。',
  },
  basic: {
    title: '就案结案',
    subtitle: '基础结局',
    body: '你查明了周伯年的直接死因——陈四为偿赌债盗香，争执中失手致死，伪造了外人撬锁的假象。案件已告一段落，但你心中隐隐感到，这件事或许还有更深的隐情……',
    trueStory: '陈四只是这场案件的表面。他背后，是钱庄东主刘万全与周伯年多年的私盐走私合谋。刘万全故意让马六诱陈四赌博欠债，将其变为眼线。周伯年死后，刘万全曾派人夜闯书房寻找暗账本以灭迹。这些，你未能完全查明。',
    hint: '提示：深入调查刘万全、寻找书房暗账本、追问马六的背后关系，或可发现此案幕后的走私网络。',
  },
  failure: {
    title: '冤假错案',
    subtitle: '失败结局',
    body: '你指认的凶手并非真正的杀人者。真相在你的手中悄然滑走，无辜者蒙冤，真正的凶手逍遥法外。清河镇的百姓对大人的判断深感失望……',
    trueStory: '当夜，是伙计陈四为偿赌债，趁夜用备用钥匙潜入库房盗取沉香。慌乱中与主人争执，推倒周伯年，后者撞上石阶当场身亡。陈四随后伪造了外人撬锁的假象。更深处，是钱庄东主刘万全布下的走私网络，控制了这一切的走向。',
    hint: '提示：仔细核查陈四的时间线、书房备用钥匙的下落，以及陈四与书房的关联。',
  },
};

export const ALL_ENDINGS: { type: EndingType; title: string; subtitle: string }[] = [
  { type: 'perfect', title: '真相大白', subtitle: '完美结局' },
  { type: 'insight', title: '心知肚明', subtitle: '洞察结局' },
  { type: 'basic', title: '就案结案', subtitle: '基础结局' },
  { type: 'failure', title: '冤假错案', subtitle: '失败结局' },
];
