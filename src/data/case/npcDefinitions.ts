import type { NpcDef } from '../../types/npc';

export const NPC_DEFINITIONS: NpcDef[] = [
  {
    id: 'chen_si',
    name: '陈四',
    title: '伙计',
    age: '二十三岁',
    description: '周伯年的跑腿伙计，做事老实但近来沾染赌博。',
    locationId: 'warehouse_scene',
    isSuspect: true,
  },
  {
    id: 'qin_shi',
    name: '秦氏',
    title: '主母',
    age: '三十五岁',
    description: '周伯年之妻，精明强干，似乎知道些不便说的事。',
    locationId: 'zhou_house',
    isSuspect: true,
  },
  {
    id: 'liu_wanquan',
    name: '刘万全',
    title: '钱庄东主',
    age: '四十八岁',
    description: '镇上最富有的商人，经营钱庄，表面热情。',
    locationId: 'pawnshop',
    isSuspect: true,
  },
  {
    id: 'zhou_fu',
    name: '周福',
    title: '管家',
    age: '五十一岁',
    description: '周家老管家，忠厚老实，掌管宅院钥匙。',
    locationId: 'zhou_house',
    isSuspect: true,
  },
  {
    id: 'ma_liu',
    name: '马六',
    title: '赌坊主',
    age: '三十八岁',
    description: '聚宝赌坊的老板，八面玲珑，跟各路人物都有往来。',
    locationId: 'gambling_den',
    isSuspect: true,
  },
  {
    id: 'song_wuzuo',
    name: '宋仵作',
    title: '仵作',
    age: '四十二岁',
    description: '县里的仵作，验尸经验丰富，为人严谨。',
    locationId: 'coroner_office',
    isSuspect: false,
  },
  {
    id: 'li_mingde',
    name: '李明德',
    title: '师爷',
    age: '五十五岁',
    description: '跟随大人多年的师爷，经验老到，可随时请教。',
    locationId: 'county_office',
    isSuspect: false,
  },
  {
    id: 'wang_danian',
    name: '王大年',
    title: '酒馆掌柜',
    age: '四十岁',
    description: '清河酒馆的掌柜，消息灵通，见过镇上大小事。',
    locationId: 'tavern',
    isSuspect: false,
  },
  {
    id: 'sun_popo',
    name: '孙婆婆',
    title: '街坊邻居',
    age: '六十七岁',
    description: '周家隔壁的老街坊，耳聪目明，但记性时好时坏。',
    locationId: 'sun_popo_alley',
    isSuspect: false,
  },
];

export function getNpcDef(id: string): NpcDef | undefined {
  return NPC_DEFINITIONS.find(n => n.id === id);
}
