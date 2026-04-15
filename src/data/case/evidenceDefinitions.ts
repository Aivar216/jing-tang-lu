import type { EvidenceItem } from '../../types/evidence';

export const EVIDENCE_DEFINITIONS: EvidenceItem[] = [
  {
    id: 'autopsy_wound_match',
    layer: 1,
    title: '伤口吻合石阶',
    description: '宋仵作确认，伤口形状与库房石阶边缘高度吻合，而非利器所伤。',
    locationHint: '仵作房',
  },
  {
    id: 'chen_si_alibi_broken_tavern',
    layer: 1,
    title: '陈四不在场证明破绽（酒馆）',
    description: '王大年证实，案发当晚亥时，陈四仍在清河酒馆未走。',
    locationHint: '清河酒馆',
  },
  {
    id: 'chen_si_alibi_broken_popo',
    layer: 1,
    title: '陈四不在场证明破绽（孙婆婆）',
    description: '孙婆婆听见子时后才有人从周家方向回来，脚步与陈四相符。',
    locationHint: '孙婆婆巷',
  },
  {
    id: 'lock_pry_inside_out',
    layer: 1,
    title: '锁具撬痕从内部制造',
    description: '宋仵作仔细检查库房门锁，撬痕方向证明是从内侧向外用力，不是外贼所为。',
    locationHint: '案发库房 / 仵作房',
  },
  {
    id: 'chen_si_gambling_habit',
    layer: 1,
    title: '陈四的赌博债务',
    description: '王大年透露，陈四近半年频繁光顾聚宝赌坊，据说欠了一大笔债。',
    locationHint: '清河酒馆',
  },
  {
    id: 'pawnshop_incense_receipt',
    layer: 1,
    title: '当铺收据',
    description: '刘氏钱庄当铺有一笔沉香典当记录，典当人名字模糊，时间恰在案发后两日。',
    locationHint: '刘氏钱庄（捕快查询）',
  },
  {
    id: 'ledger_normal',
    layer: 1,
    title: '明面账册',
    description: '书房桌面账册记录着正常的沉香进出，数字完整，并无异常。',
    locationHint: '周宅书房',
  },
  {
    id: 'hint_study_locked_drawer',
    layer: 1,
    title: '发现上锁抽屉',
    description: '书房桌面下有一个上了锁的暗抽屉，锁眼精巧，周伯年似乎刻意隐藏此物。需寻到备用钥匙或设法撬开。',
    locationHint: '周宅书房（仔细检查桌面）',
  },
  {
    id: 'ledger_shadow',
    layer: 2,
    title: '暗账本',
    description: '书房夹层中发现另一本账册，记录着大量与"官盐"名义不符的私盐货款，收款方为"刘记"。',
    locationHint: '周宅书房（仔细搜查）',
  },
  {
    id: 'large_transfers_to_bank',
    layer: 2,
    title: '巨额钱款转账记录',
    description: '暗账本显示，每季度有大笔银两流向刘氏钱庄，金额远超正常沉香生意所需。',
    locationHint: '来自暗账本',
  },
  {
    id: 'ma_liu_admission_middleman',
    layer: 2,
    title: '马六承认充当中间人',
    description: '马六在压力下承认，是刘万全让他故意诱陈四赌博，目的是控制这个人。',
    locationHint: '聚宝赌坊（施压后）',
  },
  {
    id: 'qin_shi_secret_meetings',
    layer: 2,
    title: '秦氏的秘密会面',
    description: '秦氏在信任加深后透露，丈夫生前曾与刘万全有过多次深夜密谈，她曾无意听到"私盐"二字。',
    locationHint: '周宅正堂（高信任度）',
  },
  {
    id: 'deputy_night_intruder',
    layer: 2,
    title: '夜间可疑来人',
    description: '捕快报告：案发后第五天深夜，有人翻墙进入周宅书房，似乎在翻找什么，被巡逻吓跑。',
    locationHint: '捕快夜间巡查（第五天事件）',
  },
];

export function getEvidence(id: string): EvidenceItem | undefined {
  return EVIDENCE_DEFINITIONS.find(e => e.id === id);
}
