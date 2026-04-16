import { useCallback } from 'react';
import { useGame } from '../state/GameContext';
import { checkAndGetLayer2TriggerMethod } from '../utils/layer2Checker';
import { generateDayNarration } from '../api/narratorAgent';
import type { StoryLogEntry } from '../types/game';

function makeLogId() {
  return `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useDayAdvance() {
  const { state, dispatch } = useGame();

  const advanceDay = useCallback(() => {
    // Check layer 2 trigger BEFORE advancing day
    const layer2Method = checkAndGetLayer2TriggerMethod(state);
    if (layer2Method && !state.layer2Triggered) {
      dispatch({ type: 'TRIGGER_LAYER2', method: layer2Method });
      if (layer2Method === 'time') {
        const entry: StoryLogEntry = {
          id: makeLogId(), day: state.currentDay, type: 'event',
          icon: '⚡', title: '紧急线报',
          content: '差役急报：线索指向刘万全钱庄，账目有异。',
        };
        dispatch({ type: 'ADD_STORY_LOG', entry });
      }
    }

    if (state.currentDay >= 6) {
      dispatch({ type: 'SET_PHASE', phase: 'final_judgment' });
      return;
    }

    // Day change log（v4：不含统计数据，统计在 DayEndOverlay 中展示）
    const dayEntry: StoryLogEntry = {
      id: makeLogId(), day: state.currentDay, type: 'day_change',
      icon: '🌙', title: `第 ${state.currentDay} 天结束`,
      content: `第${state.currentDay}天的调查落下帷幕。`,
    };
    dispatch({ type: 'ADD_STORY_LOG', entry: dayEntry });

    dispatch({ type: 'ADVANCE_DAY' });
    dispatch({ type: 'SET_PHASE', phase: 'day_end' });

    // 异步生成AI旁白（非阻塞）
    const dayEventSummaries = state.storyLog
      .filter(e => e.day === state.currentDay && e.type !== 'day_change')
      .map(e => e.title);
    generateDayNarration(state.currentDay, dayEventSummaries).then(narration => {
      const narrationEntry: StoryLogEntry = {
        id: makeLogId(), day: state.currentDay, type: 'narration',
        icon: '📖', title: `第 ${state.currentDay} 天 · 旁白`,
        content: narration,
      };
      dispatch({ type: 'ADD_STORY_LOG', entry: narrationEntry });
    }).catch(() => { /* 静默处理生成失败 */ });
  }, [state, dispatch]);

  const confirmDayStart = useCallback(() => {
    dispatch({ type: 'SET_PHASE', phase: 'investigation' });
  }, [dispatch]);

  return { advanceDay, confirmDayStart };
}
