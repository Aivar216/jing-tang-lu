import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { GameState, GameAction } from '../types/game';
import { gameReducer } from './gameReducer';
import { INITIAL_STATE } from './initialState';

const SAVE_KEY = 'jing-tang-lu-save';

function loadSavedState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // 校验关键字段，防止旧版存档数据导致状态异常
    if (typeof parsed.currentDay !== 'number' || !parsed.gamePhase) return null;
    if (typeof parsed.courtSessionsRemaining !== 'number' || parsed.courtSessionsRemaining < 0) return null;
    if (!Array.isArray(parsed.notebookEntries) || !Array.isArray(parsed.evidenceFound)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // 存储失败（如隐私模式容量限制）静默忽略
  }
}

export function clearSavedGame() {
  localStorage.removeItem(SAVE_KEY);
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, loadSavedState() ?? INITIAL_STATE);

  // 每次状态变更自动存档
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
