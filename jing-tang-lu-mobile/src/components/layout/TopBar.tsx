import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { getCredibilityColor } from '../../utils/credibilityEngine';
import { EVIDENCE_DEFINITIONS } from '../../data/case/evidenceDefinitions';
import { SettingsModal } from '../settings/SettingsModal';
import { loadSettings } from '../../utils/settings';
import './TopBar.css';

const TOTAL_DAYS = 6;
const TOTAL_EVIDENCE = EVIDENCE_DEFINITIONS.length;

const PERIOD_SHORT: Record<string, string> = {
  morning:   '上午',
  afternoon: '下午',
  evening:   '傍晚',
};

export function TopBar() {
  const { state } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  const apiKeySet = !!loadSettings().apiKey;

  return (
    <>
      <div className="topbar">
        {/* 左：设置按钮 */}
        <button
          className={`topbar__settings-btn ${!apiKeySet ? 'topbar__settings-btn--warn' : ''}`}
          onClick={() => setShowSettings(true)}
          title={apiKeySet ? 'API 设置' : '请先配置 API Key'}
          aria-label="设置"
        >
          {!apiKeySet ? '⚠' : '⚙'}
        </button>

        {/* 中：日期时段 + 断案令进度点 */}
        <div className="topbar__center">
          <span className="topbar__day">
            第 {state.currentDay} 天 · {PERIOD_SHORT[state.currentPeriod] ?? state.currentPeriod}
          </span>
          <div className="topbar__deadline-dots" title={`断案令：第 ${state.currentDay}/${TOTAL_DAYS} 天`}>
            {Array.from({ length: TOTAL_DAYS }, (_, i) => {
              const day = i + 1;
              const isPast = day < state.currentDay;
              const isCurrent = day === state.currentDay;
              const isUrgent = state.currentDay >= 5 && day >= state.currentDay;
              return (
                <span
                  key={day}
                  className={`topbar__ddot${isPast ? ' topbar__ddot--past' : ''}${isCurrent ? ' topbar__ddot--current' : ''}${isUrgent ? ' topbar__ddot--urgent' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* 右：行动点 + 升堂次数 + 声望分 + 证据 */}
        <div className="topbar__stats">
          {/* 行动点（三个圆点） */}
          <div className="topbar__dots" title={`行动点：${state.actionPoints}/3`}>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className={`topbar__dot ${i < state.actionPoints ? 'topbar__dot--active' : ''}`}
              />
            ))}
          </div>

          {/* 升堂次数 */}
          <span className="topbar__stat-chip" title={`剩余升堂次数：${state.courtSessionsRemaining}`}>
            ⚖ {state.courtSessionsRemaining}
          </span>

          {/* 声望分 */}
          <span
            className="topbar__stat-chip"
            style={{ color: getCredibilityColor(state.credibilityScore) }}
            title={`声望：${state.credibilityScore}`}
          >
            {state.credibilityScore}
          </span>

          {/* 证据进度 */}
          <span className="topbar__stat-chip" title={`证据：${state.evidenceFound.length}/${TOTAL_EVIDENCE}`}>
            📄 {state.evidenceFound.length}/{TOTAL_EVIDENCE}
          </span>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
