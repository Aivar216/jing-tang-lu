import type { NpcId } from '../../types/npc';
import type { LocationId } from '../../types/game';
import type { EvidenceId } from '../../types/evidence';

export interface DeputyTaskDef {
  id: string;
  type: 'surveillance' | 'search';
  label: string;
  description: string;
  targetNpcId?: NpcId;
  targetLocationId?: LocationId;
  reportText: string;
  evidenceUnlocked?: EvidenceId;
  /** v3: 只有已接触过该NPC才显示此任务 */
  requiresNpcContact?: NpcId;
  /** v3: 只有已到访过该地点才显示此任务 */
  requiresLocationVisit?: LocationId;
}

export const DEPUTY_TASK_DEFS: DeputyTaskDef[] = [
  // ── 监视类 ──
  {
    id: 'watch_chen_si',
    type: 'surveillance',
    label: '监视陈四',
    description: '暗中跟踪陈四一天，记录其行踪与接触之人。',
    targetNpcId: 'chen_si',
    requiresNpcContact: 'chen_si',
    reportText: '陈四白日在铺子做事，神色不安，数次朝赌坊方向张望。入夜后前往聚宝赌坊，与一名络腮胡男子低声交谈约半个时辰，临走前接过一个布包。',
    evidenceUnlocked: 'chen_si_gambling_debt',
  },
  {
    id: 'watch_liu_wanquan',
    type: 'surveillance',
    label: '监视刘万全',
    description: '盯梢刘万全，掌握其日常往来与可疑联络。',
    targetNpcId: 'liu_wanquan',
    requiresNpcContact: 'liu_wanquan',
    reportText: '刘万全白日在钱庄处理账务。傍晚遣走伙计后，一名外地口音的男子登门，在内室约谈约一个时辰方才离开。刘万全送客时叮嘱对方："此事不必声张。"',
    evidenceUnlocked: 'liu_secret_visitor',
  },
  {
    id: 'watch_zhou_fu',
    type: 'surveillance',
    label: '监视周福',
    description: '监视周家老管家周福的行踪。',
    targetNpcId: 'zhou_fu',
    requiresNpcContact: 'zhou_fu',
    reportText: '周福白日频繁出入库房，神情凝重。午后与一陌生男子在后门短暂交谈，从怀中取出一封书信交予对方。',
  },
  {
    id: 'watch_ma_liu',
    type: 'surveillance',
    label: '监视马六',
    description: '暗中跟随赌坊马六，了解其背后关系网。',
    targetNpcId: 'ma_liu',
    requiresNpcContact: 'ma_liu',
    reportText: '马六上午在赌坊收账，下午独自前往刘万全钱庄，入内约半个时辰后离开，面色铁青。夜间赌坊后院停有一辆客商马车，车主未露面。',
  },
  {
    id: 'watch_qin_shi',
    type: 'surveillance',
    label: '留意秦氏动向',
    description: '观察秦氏的日常行为，看是否有异常接触。',
    targetNpcId: 'qin_shi',
    requiresNpcContact: 'qin_shi',
    reportText: '秦氏全日深居简出，傍晚出门烧香。返途中于巷口与一名行商模样的中年男子简短交谈后匆匆离开。',
  },

  // ── 调查类 ──
  {
    id: 'search_gambling_den',
    type: 'search',
    label: '调查赌坊账目',
    description: '到赌坊摸清陈四的欠债情况与赌坊和钱庄的资金往来。',
    targetLocationId: 'gambling_den',
    requiresLocationVisit: 'gambling_den',
    reportText: '捕快在赌坊账簿中查到：陈四积欠赌坊纹银四十两，马六曾数次上门催债。账簿另有一批款项来路不明，收款方登记为"刘记"。马六称此事系"上面的人"交代，但不愿多说。',
    evidenceUnlocked: 'ma_liu_instigated',
  },
  {
    id: 'search_pawnshop',
    type: 'search',
    label: '暗查当铺记录',
    description: '在当铺查找是否有人典当周家物件或沉香相关的交易。',
    targetLocationId: 'pawnshop',
    requiresLocationVisit: 'pawnshop',
    reportText: '当铺账册显示：案发后两日，有人以约三十斤上等沉香为押换取银三十两，代劳者为一身形瘦小的陌生男子，登记人名为"周记货行"但非本人到场。',
    evidenceUnlocked: 'pawnshop_incense',
  },
  {
    id: 'search_warehouse',
    type: 'search',
    label: '仔细复查库房',
    description: '对案发库房进行仔细复查，寻找初次勘查可能遗漏的线索。',
    targetLocationId: 'warehouse_scene',
    requiresLocationVisit: 'warehouse_scene',
    reportText: '捕快仔细复查库房：在东侧墙角暗格处发现少量细碎白色颗粒，经仵作初步鉴定，疑为盐粒。暗格原本有锁，锁已被打开。',
    evidenceUnlocked: 'warehouse_salt_residue',
  },
  {
    id: 'search_tavern',
    type: 'search',
    label: '核实酒馆证词',
    description: '前往酒馆核实陈四案发当晚的时间证词。',
    targetLocationId: 'tavern',
    requiresLocationVisit: 'tavern',
    reportText: '酒馆掌柜王大年记得：陈四当晚在酒馆喝到亥时末方才离开，结账时与邻桌有过口角，在场数人均可为证。',
    evidenceUnlocked: 'chen_si_tavern_alibi',
  },
  {
    id: 'search_sun_popo_alley',
    type: 'search',
    label: '再访孙婆婆',
    description: '走访孙婆婆所在里弄，进一步核实她听到的夜间动静。',
    targetLocationId: 'sun_popo_alley',
    requiresLocationVisit: 'sun_popo_alley',
    reportText: '孙婆婆再次确认：子时后听到一个人从周家方向匆匆走过，脚步沉重，与平日陈四回家的脚步声相似。她还提及当晚更早时候，曾听到一个较轻的脚步声经过，但不确定是谁。',
    evidenceUnlocked: 'chen_si_popo_return',
  },
];
