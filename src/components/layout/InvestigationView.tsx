import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { LOCATIONS } from '../../data/case/locations';
import { canInitiateCourt, canAdvanceDay } from '../../state/selectors';
import { useDayAdvance } from '../../hooks/useDayAdvance';
import { CourtSetup } from '../court/CourtSetup';
import { SearchResultModal } from '../search/SearchResultModal';
import { EVIDENCE_DEFINITIONS } from '../../data/case/evidenceDefinitions';
import type { StoryLogEntry } from '../../types/game';
import './InvestigationView.css';

function makeLogId() { return `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

/**
 * 地点可搜查动作表（v4：描述模糊化，仅保留物理搜查/勘查类）
 * requires：前置证据（已掌握才显示此动作）
 * requiresLayer2：需要第二层已触发
 *
 * 注意：问询类选项（向NPC打探/询问）已移入对话系统。
 * 陈四行踪（E7/E8）、陈四赌债（E10）通过对话获取。
 */
const LOCATION_EVIDENCE: Record<string, {
  evidenceId: string;
  label: string;
  requires?: string;
  requiresLayer2?: boolean;
}[]> = {
  // ── 案发库房 ──
  warehouse_scene: [
    { evidenceId: 'master_key_on_body',       label: '检查仵作的验尸记录与遗物' },
    { evidenceId: 'warehouse_door_pried',     label: '勘查库房大门',               requires: 'master_key_on_body' },
    { evidenceId: 'warehouse_two_footprints', label: '复查库房地面',               requires: 'warehouse_door_pried' },
    { evidenceId: 'warehouse_salt_residue',   label: '细致搜查库房内部',           requires: 'warehouse_door_pried', requiresLayer2: true },
  ],

  // ── 仵作房 ──
  coroner_office: [
    { evidenceId: 'autopsy_stair_wound',      label: '请仵作详解死因与伤痕' },
  ],

  // ── 周宅书房（3步锁链）──
  zhou_study: [
    { evidenceId: 'ledger_normal',            label: '检查书桌上的账册' },
    { evidenceId: 'hint_study_locked_drawer', label: '检查书桌下方抽屉',           requires: 'ledger_normal' },
    { evidenceId: 'study_drawer_key_imprint', label: '仔细查看抽屉内部',           requires: 'hint_study_locked_drawer' },
    { evidenceId: 'ledger_shadow',            label: '撬开上锁的抽屉',             requires: 'study_drawer_key_imprint' },
  ],

  // ── 清河酒馆（v4：物理搜查，问询移入对话）──
  tavern: [
    { evidenceId: 'tavern_ledger_check',      label: '在柜台附近查看' },
    { evidenceId: 'tavern_back_storage',       label: '检查后厨',             requires: 'tavern_ledger_check' },
  ],

  // ── 孙婆婆巷（v4：物理搜查，问询移入对话）──
  sun_popo_alley: [
    { evidenceId: 'alley_ground_traces',      label: '勘查巷道地面痕迹' },
    { evidenceId: 'alley_walls_check',         label: '检查院墙与门窗' },
  ],

  // ── 刘氏当铺 ──
  pawnshop: [
    { evidenceId: 'pawnshop_incense',         label: '查阅当铺近期交易账目' },
  ],
};

export function InvestigationView() {
  const { state, dispatch } = useGame();
  const { advanceDay } = useDayAdvance();
  const [showCourtSetup, setShowCourtSetup] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    title: string;
    description: string;
    sourceLabel: string;
    entryType: string;
  } | null>(null);
  const loc = LOCATIONS.find(l => l.id === state.currentLocation);

  const locationActions = LOCATION_EVIDENCE[state.currentLocation] ?? [];

  const handleSearch = (evidenceId: string) => {
    dispatch({ type: 'ADD_EVIDENCE', evidenceId: evidenceId as never });
    const evDef = EVIDENCE_DEFINITIONS.find(e => e.id === evidenceId);

    // 弹窗展示搜查结果
    if (evDef) {
      setSearchResult({
        title: evDef.title,
        description: evDef.description,
        sourceLabel: evDef.sourceLabel ?? '现场勘查',
        entryType: evDef.entryType === 'observation' ? '观察' : '物证',
      });

      // 剧情录：简要标记
      const logEntry: StoryLogEntry = {
        id: makeLogId(), day: state.currentDay, type: 'evidence',
        icon: '📄',
        title: `发现：${evDef.title}`,
        content: `在${evDef.sourceLabel ?? '现场'}有所发现`,
      };
      dispatch({ type: 'ADD_STORY_LOG', entry: logEntry });
    }

    if (evidenceId === 'ledger_shadow') {
      dispatch({ type: 'TRIGGER_LAYER2', method: 'evidence' });
      dispatch({
        type: 'ADD_STORY_LOG',
        entry: {
          id: makeLogId(), day: state.currentDay, type: 'event',
          icon: '⚡', title: '重要发现：案情另有隐情',
          content: '暗账本指向不明资金往来，收款方"刘记"指向钱庄。',
        },
      });
    }
  };

  const noAP = state.actionPoints <= 0;
  const showCourt = canInitiateCourt(state);
  const showAdvance = canAdvanceDay(state);
  const isFinalDay = state.currentDay >= 6;

  return (
    <div className="investigation-view">

      {/* ── 区块 1：地点信息 ── */}
      <div className="inv-section inv-section--location">
        <h2 className="investigation-view__location-name">{loc?.name ?? '未知地点'}</h2>
        <p className="investigation-view__location-desc">{loc?.description}</p>
      </div>

      {/* ── 隐情提示 ── */}
      {state.layer2Triggered && (
        <div className="investigation-view__alert">
          <strong>线索更新：</strong>暗账本已在手，收款方"刘记"指向刘万全钱庄。深入调查刘万全、马六与秦氏，或可揭开更深的真相。
        </div>
      )}

      {/* ── 区块 2：当地搜查 ── */}
      {locationActions.length > 0 && (
        <div className="inv-section">
          <div className="inv-section__label">当前地点可搜查</div>
          <div className="inv-search-list">
            {locationActions.map(action => {
              const alreadyFound = state.evidenceFound.includes(action.evidenceId as never);
              const prerequisiteMet = !action.requires || state.evidenceFound.includes(action.requires as never);
              const layer2Met = !action.requiresLayer2 || state.layer2Triggered;
              const isLocked = !prerequisiteMet || !layer2Met;
              return (
                <button
                  key={action.evidenceId}
                  className={`inv-btn inv-btn--search ${alreadyFound ? 'inv-btn--done' : ''} ${isLocked ? 'inv-btn--locked' : ''}`}
                  onClick={() => !alreadyFound && !isLocked && handleSearch(action.evidenceId)}
                  disabled={alreadyFound || isLocked}
                  title={isLocked ? (action.requiresLayer2 && !state.layer2Triggered ? '需要更多调查才能发现' : '需先完成前置调查') : alreadyFound ? '已录入案卷' : ''}
                >
                  <span className="inv-btn__icon">
                    {alreadyFound ? '✓' : isLocked ? '🔒' : '🔍'}
                  </span>
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 区块 3：行动点提示 ── */}
      {noAP && (
        <div className="inv-ap-exhausted">
          今日行动点已耗尽，可推进日期继续调查。
        </div>
      )}

      {/* ── 区块 4：重大行动（升堂） ── */}
      {showCourt && (
        <div className="inv-section inv-section--court">
          <div className="inv-section__label">案件行动</div>
          <button
            className="inv-btn inv-btn--court"
            onClick={() => setShowCourtSetup(true)}
          >
            <span className="inv-btn__court-icon">⚖️</span>
            <span className="inv-btn__court-text">
              <span className="inv-btn__court-title">升堂问案</span>
              <span className="inv-btn__court-sub">剩余 {state.courtSessionsRemaining} 次机会</span>
            </span>
          </button>
        </div>
      )}

      {/* ── 底部固定：结束当天 ── */}
      {showAdvance && (
        <div className="inv-day-footer">
          <button
            className={`inv-btn inv-btn--advance ${isFinalDay ? 'inv-btn--final' : ''}`}
            onClick={advanceDay}
          >
            {isFinalDay ? '⚖ 做出最终判决' : `结束第 ${state.currentDay} 天 →`}
          </button>
        </div>
      )}

      {showCourtSetup && <CourtSetup onClose={() => setShowCourtSetup(false)} />}
      {searchResult && (
        <SearchResultModal
          title={searchResult.title}
          description={searchResult.description}
          sourceLabel={searchResult.sourceLabel}
          entryType={searchResult.entryType}
          onClose={() => setSearchResult(null)}
        />
      )}
    </div>
  );
}
