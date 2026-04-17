export interface TutorialStep {
  id: number;
  text: string;
  speaker: string;
  summary?: string;
  action?: 'move_to_warehouse' | 'move_to_coroner' | 'move_to_tavern' | 'free';
}

export const DAY1_TUTORIAL: TutorialStep[] = [
  {
    id: 0,
    speaker: '师爷李明德',
    text: '大人，清河镇昨夜发生命案。沉香商人周伯年在自家库房身亡，仵作初步验尸已毕。上头下了断案令，限期六日查明真相。六日之内若不能破案交人，你我都要担责。请大人务必抓紧。',
    summary: '天色微明，师爷李明德匆匆来报：清河镇昨夜出了人命，沉香商人周伯年死于自家库房。上头下了断案令，限期六日破案。',
  },
  {
    id: 1,
    speaker: '李明德',
    text: '案发现场在周家库房。据报是门锁遭人撬开，周伯年倒毙其中。大人不妨先去案发现场看看，再传仵作问询。',
    summary: '李明德引路，案发之地在周家库房，门锁有撬痕。大人决定先行前往查看。',
    action: 'move_to_warehouse',
  },
  {
    id: 2,
    speaker: '旁白',
    text: '你来到周家库房。门锁上有撬痕，但仔细一看，似乎有些奇怪……旁边有个叫陈四的伙计被暂时看管在此，神情慌张。',
    summary: '库房门前，门锁撬痕犹在，然细观之下颇为蹊跷。一旁看管着的伙计陈四神色慌张，目光游移。',
  },
  {
    id: 3,
    speaker: '李明德',
    text: '大人，仵作宋先生已初步验过尸身，可询问他的检验结果。陈四是第一个发现尸体的人，也可先问他。一天只有三次问询机会，六天限期，请大人斟酌。',
    summary: '李明德禀道，仵作宋先生已验过尸身，陈四乃第一个发现尸体之人。一日仅三次问询之机，六天限期，请大人定夺。',
    action: 'free',
  },
];
