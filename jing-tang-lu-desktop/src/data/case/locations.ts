import type { LocationDef } from '../../types/game';

export const LOCATIONS: LocationDef[] = [
  {
    id: 'county_office',
    name: '县衙',
    description: '县衙大堂，处理公务、升堂问案之所。',
    npcIds: ['li_mingde'],
  },
  {
    id: 'zhou_house',
    name: '周宅正堂',
    description: '沉香商人周伯年的宅院正堂。秦氏居于此处。',
    npcIds: ['qin_shi', 'zhou_fu'],
  },
  {
    id: 'warehouse_scene',
    name: '案发库房',
    description: '周家的沉香库房，案发现场。门锁疑似遭人撬动。',
    npcIds: ['chen_si'],  // Bug #8: 仵作只在仵作房，不在案发库房
  },
  {
    id: 'zhou_study',
    name: '周宅书房',
    description: '周伯年的私人书房，据说有账册在此。',
    npcIds: ['zhou_fu'],
    unlockedFromDay: 2,
  },
  {
    id: 'pawnshop',
    name: '刘氏钱庄',
    description: '刘万全经营的当铺兼钱庄，镇上财力最雄厚的商号。',
    npcIds: ['liu_wanquan'],
    unlockedFromDay: 2,
  },
  {
    id: 'gambling_den',
    name: '聚宝赌坊',
    description: '马六经营的赌坊，鱼龙混杂，消息灵通。',
    npcIds: ['ma_liu'],
    unlockedFromDay: 2,
  },
  {
    id: 'tavern',
    name: '清河酒馆',
    description: '镇上最热闹的酒馆，王大年掌柜见多识广。',
    npcIds: ['wang_danian'],
  },
  {
    id: 'sun_popo_alley',
    name: '孙婆婆巷',
    description: '周家隔壁的老巷，孙婆婆在此居住多年。',
    npcIds: ['sun_popo'],
  },
  {
    id: 'coroner_office',
    name: '仵作房',
    description: '宋仵作检验尸身之处，存有验尸记录。',
    npcIds: ['song_wuzuo'],
  },
];

export function getLocation(id: string): LocationDef | undefined {
  return LOCATIONS.find(l => l.id === id);
}
