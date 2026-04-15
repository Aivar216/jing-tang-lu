export type EvidenceId =
  | 'autopsy_wound_match'
  | 'chen_si_alibi_broken_tavern'
  | 'chen_si_alibi_broken_popo'
  | 'lock_pry_inside_out'
  | 'chen_si_gambling_habit'
  | 'pawnshop_incense_receipt'
  | 'ledger_normal'
  | 'hint_study_locked_drawer'
  | 'ledger_shadow'
  | 'large_transfers_to_bank'
  | 'ma_liu_admission_middleman'
  | 'qin_shi_secret_meetings'
  | 'deputy_night_intruder';

export type EvidenceLayer = 1 | 2;

export interface EvidenceItem {
  id: EvidenceId;
  layer: EvidenceLayer;
  title: string;
  description: string;
  locationHint?: string;
}
