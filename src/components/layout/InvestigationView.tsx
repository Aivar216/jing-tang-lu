import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { LOCATIONS } from '../../data/case/locations';
import { canInitiateCourt, canAdvanceDay } from '../../state/selectors';
import { useDayAdvance } from '../../hooks/useDayAdvance';
import { CourtSetup } from '../court/CourtSetup';
import { EVIDENCE_DEFINITIONS } from '../../data/case/evidenceDefinitions';
import type { StoryLogEntry } from '../../types/game';
import './InvestigationView.css';

function makeLogId() { return `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

const LOCATION_EVIDENCE: Record<string, { evidenceId: string; label: string; requires?: string }[]> = {
  warehouse_scene: [
    { evidenceId: 'lock_pry_inside_out', label: '仔细检查门锁撬痕' },
  ],
  coroner_office: [
    { evidenceId: 'autopsy_wound_match', label: '查阅验尸报告' },
  ],
  zhou_study: [
    { evidenceId: 'ledger_normal', label: '查看桌面账册（明面账本）' },
    { evidenceId: 'hint_study_locked_drawer', label: '发现桌下上锁暗抽屉', requires: 'ledger_normal' },
    { evidenceId: 'ledger_shadow', label: '撬开暗抽屉（取得暗账本）', requires: 'hint_study_locked_drawer' },
  ],
  tavern: [
    { evidenceId: 'chen_si_alibi_broken_tavern', label: '向王大年打探陈四当晚行踪' },
    { evidenceId: 'chen_si_gambling_habit', label: '打听陈四的赌博情况' },
  ],
  sun_popo_alley: [
    { evidenceId: 'chen_si_alibi_broken_popo', label: '询问孙婆婆当晚所见所闻' },
  ],
};

export function InvestigationView() {
  const { state, dispatch } = useGame();
  const { advanceDay } = useDayAdvance();
  const [showCourtSetup, setShowCourtSetup] = useState(false);
  const loc = LOCATIONS.find(l => l.id === state.currentLocation);

  const locationActions = LOCATION_EVIDENCE[state.currentLocation] ?? [];

  const handleSearch = (evidenceId: string) => {
    dispatch({ type: 'ADD_EVIDENCE', evidenceId: evidenceId as never });
    const evDef = EVIDENCE_DEFINITIONS.find(e => e.id === evidenceId);
    if (evDef) {
      const logEntry: StoryLogEntry = {
        id: makeLogId(), day: state.currentDay, type: 'evidence',
        icon: evDef.layer === 2 ? '🔍' : '📄',
        title: `发现证据：${evDef.title}`,
        content: evDef.description,
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
          content: '暗账本揭示此案背后疑有私盐走私网络，刘万全极可能是幕后主使。',
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
          <strong>线索更新：</strong>此案疑有更深隐情——私盐走私幕后之人尚未浮出水面。深入调查刘万全与暗账本或可揭开真相。
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
              return (
                <button
                  key={action.evidenceId}
                  className={`inv-btn inv-btn--search ${alreadyFound ? 'inv-btn--done' : ''} ${!prerequisiteMet ? 'inv-btn--locked' : ''}`}
                  onClick={() => !alreadyFound && prerequisiteMet && handleSearch(action.evidenceId)}
                  disabled={alreadyFound || !prerequisiteMet}
                  title={!prerequisiteMet ? '需先完成前置调查' : alreadyFound ? '已记录' : ''}
                >
                  <span className="inv-btn__icon">
                    {alreadyFound ? '✓' : !prerequisiteMet ? '🔒' : '🔍'}
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

      {/* ── 区块 5：已掌握证据 ── */}
      {state.evidenceFound.length > 0 && (
        <div className="inv-section">
          <div className="inv-section__label">已掌握证据（{state.evidenceFound.length} 项）</div>
          <div className="investigation-view__evidence-cards">
            {state.evidenceFound.map(id => {
              const evDef = EVIDENCE_DEFINITIONS.find(e => e.id === id);
              return (
                <div key={id} className={`ev-card ${evDef?.layer === 2 ? 'ev-card--layer2' : ''}`}>
                  <div className="ev-card__title">
                    {evDef?.layer === 2 && <span className="ev-card__badge">隐情</span>}
                    {evDef?.title ?? id}
                  </div>
                  {evDef?.description && (
                    <div className="ev-card__desc">{evDef.description}</div>
                  )}
                </div>
              );
            })}
          </div>
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
    </div>
  );
}
