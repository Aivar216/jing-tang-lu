import type { NpcId } from '../../types/npc';
import type { LocationId } from '../../types/game';
import type { EvidenceId } from '../../types/evidence';

export type DeputyTaskValueLevel = 'high' | 'medium' | 'low';

export interface DeputyTaskDef {
  id: string;
  type: 'surveillance' | 'search';
  label: string;
  description: string;
  targetNpcId?: NpcId;
  targetLocationId?: LocationId;
  reportText: string;
  valueLevel: DeputyTaskValueLevel;
  evidenceUnlocked?: EvidenceId;
}

export const DEPUTY_TASK_DEFS: DeputyTaskDef[] = [
  // ── 监视类 ──
  {
    id: 'watch_chen_si',
    type: 'surveillance',
    label: '跟踪陈四',
    description: '暗中跟踪陈四一天，记录其行踪与接触之人。',
    targetNpcId: 'chen_si',
    reportText: '陈四白日在铺子假装干活，实则心神不宁，数次往酒馆方向张望。入夜后见其悄然前往赌坊，与一名络腮胡男子低声交谈许久，面色凝重，临走前接过一个布包。',
    valueLevel: 'high',
    evidenceUnlocked: 'chen_si_gambling_habit',
  },
  {
    id: 'watch_liu_wanquan',
    type: 'surveillance',
    label: '跟踪刘万全',
    description: '盯梢刘万全，掌握其日常往来与可疑联络。',
    targetNpcId: 'liu_wanquan',
    reportText: '刘万全当日在钱庄处理账务，态度如常。傍晚遣走伙计后，马六登门约半个时辰，出来时刘万全面色铁青，嘱咐马六"把嘴管严"。',
    valueLevel: 'high',
  },
  {
    id: 'watch_zhou_fu',
    type: 'surveillance',
    label: '跟踪周福',
    description: '监视周家老管家周福的行踪。',
    targetNpcId: 'zhou_fu',
    reportText: '周福白日频繁出入库房清点货物，神情惴惴。午后曾与一生人在后门短暂交谈，似乎是送出一封书信。',
    valueLevel: 'medium',
  },
  {
    id: 'watch_ma_liu',
    type: 'surveillance',
    label: '跟踪马六',
    description: '暗中跟随赌坊马六，了解其背后关系网。',
    targetNpcId: 'ma_liu',
    reportText: '马六上午在赌坊收账，下午去刘万全钱庄一趟，夜里又回赌坊。全程未见异常，但捕快注意到赌坊后院停着一辆不常见的客商马车。',
    valueLevel: 'medium',
  },
  {
    id: 'watch_qin_shi',
    type: 'surveillance',
    label: '留意秦氏动向',
    description: '观察秦氏的日常行为，看是否有异常接触。',
    targetNpcId: 'qin_shi',
    reportText: '秦氏全日深居简出，只在傍晚出门烧香。返途中曾与一名行商模样的中年男子在巷口简短交谈，随后匆匆离开，神色落寞。',
    valueLevel: 'low',
  },

  // ── 调查类 ──
  {
    id: 'search_gambling_den',
    type: 'search',
    label: '调查赌坊账目',
    description: '到赌坊摸清陈四的欠债情况与赌坊和钱庄的资金往来。',
    targetLocationId: 'gambling_den',
    reportText: '捕快摸清：陈四在赌坊积欠纹银四十两，马六曾数次上门催债，并透露"后台的人"已派人催过。账簿上另有一批款项走向不明，似乎是通过赌坊流入刘万全的钱庄。',
    valueLevel: 'high',
    evidenceUnlocked: 'ma_liu_admission_middleman',
  },
  {
    id: 'search_pawnshop',
    type: 'search',
    label: '暗查当铺记录',
    description: '在当铺查找是否有人典当周家物件或沉香相关的交易。',
    targetLocationId: 'pawnshop',
    reportText: '当铺账册显示：案发前五日，有人以"上等沉香"抵押换银三十两，登记人名为"周记货行"，但核对后发现并非正主本人到场，系由一陌生男子代劳。',
    valueLevel: 'high',
    evidenceUnlocked: 'pawnshop_incense_receipt',
  },
  {
    id: 'search_tavern',
    type: 'search',
    label: '问询酒馆掌柜',
    description: '前往酒馆核实陈四案发当晚的时间证词。',
    targetLocationId: 'tavern',
    reportText: '酒馆掌柜王大年明确记得：陈四当晚在酒馆喝到亥时末方才离开，结账时还与邻桌起了口角。这与陈四自称"酉时已回家"的说法相差两个时辰有余。',
    valueLevel: 'high',
    evidenceUnlocked: 'chen_si_alibi_broken_tavern',
  },
  {
    id: 'search_sun_popo_alley',
    type: 'search',
    label: '探访孙婆婆',
    description: '走访孙婆婆所在里弄，进一步核实她听到的夜间动静。',
    targetLocationId: 'sun_popo_alley',
    reportText: '孙婆婆再度确认：子时后听到一个人从周家方向匆匆走过，脚步沉重，与平日陈四回家时的声音相似。她还提及当晚库房方向曾有微弱灯光一闪。',
    valueLevel: 'medium',
    evidenceUnlocked: 'chen_si_alibi_broken_popo',
  },
  {
    id: 'search_coroner',
    type: 'search',
    label: '追问仵作细节',
    description: '再次拜访仵作，要求补充伤口和门锁细节。',
    targetLocationId: 'coroner_office',
    reportText: '仵作宋仵作补充说：门闩撬痕确系从内侧制造，且力道方向表明是以细铁片从门缝伸入拨动，手法娴熟，绝非仓促之举。此外，尸体手腕内侧有细小搏斗勒痕，极可能曾被短暂制压。',
    valueLevel: 'high',
    evidenceUnlocked: 'lock_pry_inside_out',
  },
];
