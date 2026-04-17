import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { getCredibilityLabel, getCredibilityColor } from '../../utils/credibilityEngine';
import { EVIDENCE_DEFINITIONS } from '../../data/case/evidenceDefinitions';
import { SettingsModal } from '../settings/SettingsModal';
import { loadSettings } from '../../utils/settings';
import './TopBar.css';

const TOTAL_EVIDENCE = EVIDENCE_DEFINITIONS.length;

const TOTAL_DAYS = 6;
const PERIOD_LABELS = {
  morning: '上午',
  afternoon: '下午',
  evening: '傍晚',
};

export function TopBar() {
  const { state } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  const apiKeySet = !!loadSettings().apiKey;

  return (
    <>
      <div className="topbar">
        <div className="topbar__title">惊堂录 · 沉香劫</div>

        <div className="topbar__center">
          <div className="topbar__deadline">
            <span className="topbar__deadline-label">断案令</span>
            <div className="topbar__deadline-dots">
              {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                const day = i + 1;
                const isPast = day < state.currentDay;
                const isCurrent = day === state.currentDay;
                const isUrgent = state.currentDay >= 5 && day >= state.currentDay;
                return (
                  <span
                    key={day}
                    className={`topbar__ddot${isPast ? ' topbar__ddot--past' : ''}${isCurrent ? ' topbar__ddot--current' : ''}${isUrgent ? ' topbar__ddot--urgent' : ''}`}
                    title={`第 ${day} 天`}
                  />
                );
              })}
            </div>
          </div>
          <span className="topbar__day">第 {state.currentDay} 天 · {PERIOD_LABELS[state.currentPeriod]}</span>
        </div>

        <div className="topbar__stats">
          <div className="topbar__stat">
            <span className="topbar__stat-label">行动</span>
            <div className="topbar__dots">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className={`topbar__dot ${i < state.actionPoints ? 'topbar__dot--active' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="topbar__stat">
            <span className="topbar__stat-label">升堂</span>
            <span className="topbar__stat-value">{state.courtSessionsRemaining}</span>
          </div>

          <div className="topbar__stat">
            <span className="topbar__stat-label">声望</span>
            <span
              className="topbar__stat-value"
              style={{ color: getCredibilityColor(state.credibilityScore) }}
            >
              {state.credibilityScore} · {getCredibilityLabel(state.credibilityScore)}
            </span>
          </div>

          <div className="topbar__stat">
            <span className="topbar__stat-label">证据</span>
            <span className="topbar__stat-value">{state.evidenceFound.length}/{TOTAL_EVIDENCE}</span>
          </div>

          <button
            className={`topbar__settings-btn ${!apiKeySet ? 'topbar__settings-btn--warn' : ''}`}
            onClick={() => setShowSettings(true)}
            title={apiKeySet ? 'API 设置' : '请先配置 API Key'}
          >
            {!apiKeySet ? '⚠ 配置 API' : '⚙ 设置'}
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
