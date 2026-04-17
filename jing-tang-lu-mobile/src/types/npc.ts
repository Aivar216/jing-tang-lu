export type NpcId =
  | 'chen_si'
  | 'qin_shi'
  | 'liu_wanquan'
  | 'zhou_fu'
  | 'ma_liu'
  | 'song_wuzuo'
  | 'li_mingde'
  | 'wang_danian'
  | 'sun_popo';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface NpcState {
  trust: number;
  conversationHistory: ChatMessage[];
  revealedFactIds: string[];
  flags: Record<string, boolean>;
  isArrested: boolean;
}

export interface NpcDef {
  id: NpcId;
  name: string;
  title: string;
  age: string;
  description: string;
  locationId: import('./game').LocationId;
  isSuspect: boolean;
}
