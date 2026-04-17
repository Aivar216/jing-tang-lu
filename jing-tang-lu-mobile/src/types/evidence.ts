export type EvidenceId =
  // ── 第一层：指向陈四 ──
  | 'master_key_on_body'         // E1  主钥匙在死者腰间
  | 'warehouse_door_pried'       // E2  库房门从外部撬开
  | 'autopsy_stair_wound'        // E3  死者头部与石阶棱角吻合
  | 'study_drawer_key_imprint'   // E4  书房抽屉钥匙凹痕但钥匙不在
  | 'spare_key_existed'          // E5  曾有一把备用钥匙放在此处
  | 'chen_si_near_study'         // E6  陈四被看到在书房附近出没
  | 'chen_si_tavern_alibi'       // E7  陈四亥时仍在酒馆（王大年证词）
  | 'chen_si_popo_return'        // E8  陈四子时后才回住处（孙婆婆证词）
  | 'pawnshop_incense'           // E9  当铺近日收到约三十斤沉香
  | 'chen_si_gambling_debt'      // E10 陈四欠赌坊赌债
  // ── 第二层：指向刘万全 ──
  | 'zhou_liu_secret_meetings'   // E11 秦氏透露丈夫常与刘万全密会
  | 'ledger_shadow'              // E12 暗账本（大量不明资金往来）
  | 'ma_liu_instigated'          // E13 马六承认受"钱庄那边"指使关照陈四
  | 'liu_secret_visitor'         // E14 刘万全案发前与外地人密会该人已离镇
  | 'liu_destroy_ledger_attempt' // E15 刘万全派人深夜潜入周家试图销毁账本
  | 'warehouse_salt_residue'     // E16 库房暗格有盐粒残留
  // ── 额外物证 ──
  | 'warehouse_two_footprints'   // 库房地面有两组不同时间的踩踏痕迹
  | 'popo_early_footsteps'       // 孙婆婆称更早有人经过（指向周福）
  // ── 中间/前置证据（用于解锁下一步，不进终局判定）──
  | 'ledger_normal'              // 明面账册（书房搜查第1步）
  | 'hint_study_locked_drawer'   // 发现上锁暗抽屉（取暗账本前置）
  // ── v4: 物理搜查新增 ──
  | 'tavern_ledger_check'        // 酒馆记账本——陈四赊账频繁
  | 'tavern_back_storage'        // 酒馆后厨——发现不属于酒馆的布袋
  | 'alley_ground_traces'        // 巷道地面——近期清扫痕迹
  | 'alley_walls_check';         // 院墙门窗——完好无撬动

export type EvidenceLayer = 1 | 2;

export interface EvidenceItem {
  id: EvidenceId;
  layer: EvidenceLayer;
  title: string;
  description: string;
  /** 显示在案卷条目中的来源标签（用于 speaker 为空时显示） */
  sourceLabel?: string;
  /** v4: 案卷条目类型（物证/观察），默认 physical */
  entryType?: 'physical' | 'observation';
}
