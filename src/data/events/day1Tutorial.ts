export interface TutorialStep {
  id: number;
  text: string;
  speaker: string;
  action?: 'move_to_warehouse' | 'move_to_coroner' | 'move_to_tavern' | 'free';
}

export const DAY1_TUTORIAL: TutorialStep[] = [
  {
    id: 0,
    speaker: '师爷李明德',
    text: '大人，清河镇昨夜发生命案。沉香商人周伯年在自家库房身亡，仵作初步验尸已毕。镇上议论纷纷，请大人移步查看。',
  },
  {
    id: 1,
    speaker: '李明德',
    text: '案发现场在周家库房。据报是门锁遭人撬开，周伯年倒毙其中。大人不妨先去案发现场看看，再传仵作问询。',
    action: 'move_to_warehouse',
  },
  {
    id: 2,
    speaker: '旁白',
    text: '你来到周家库房。门锁上有撬痕，但仔细一看，似乎有些奇怪……库房内还站着宋仵作，正等候大人问询。另外，有个叫陈四的伙计被暂时看管在旁，神情慌张。',
  },
  {
    id: 3,
    speaker: '李明德',
    text: '大人，仵作宋先生已初步验过尸身，可询问他的检验结果。陈四是第一个发现尸体的人，也可先问他。一天只有三次问询机会，请大人斟酌。',
    action: 'free',
  },
];
