import { useState, useCallback } from 'react';
import type { NpcId } from '../types/npc';
import type { Verdict } from '../types/court';
import type { StoryLogEntry } from '../types/game';
import { useGame } from '../state/GameContext';
import {
  generateCourtResponse,
  COURT_MAX_TURNS,
} from '../api/courtOrchestrator';
import { getActiveCourtSession } from '../state/selectors';
import { NPC_DEFINITIONS } from '../data/case/npcDefinitions';

function makeLogId() { return `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export function useCourt() {
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession = getActiveCourtSession(state);

  const startCourt = useCallback(
    (participants: NpcId[]) => {
      dispatch({ type: 'START_COURT', participants });
    },
    [dispatch]
  );

  const addPlayerTurn = useCallback(
    async (sessionId: string, content: string, citedEntryId?: string) => {
      dispatch({
        type: 'ADD_COURT_TURN',
        sessionId,
        turn: { actor: 'player', content, citedEntryId },
      });

      const session = state.courtHistory.find(s => s.id === sessionId);
      if (!session || session.participants.length < 2) return;

      const [npc1, npc2] = session.participants;
      const allTurns = [
        ...session.turns,
        { actor: 'player' as const, content, citedEntryId },
      ];

      setIsLoading(true);
      setError(null);
      try {
        // NPC1 responds
        const npc1Response = await generateCourtResponse(
          npc1,
          npc2,
          allTurns[allTurns.length - 1],
          allTurns,
          state
        );
        dispatch({
          type: 'ADD_COURT_TURN',
          sessionId,
          turn: { actor: npc1, content: npc1Response },
        });

        // NPC2 always responds
        const npc2Response = await generateCourtResponse(
          npc2,
          npc1,
          { actor: npc1, content: npc1Response },
          [...allTurns, { actor: npc1, content: npc1Response }],
          state
        );
        dispatch({
          type: 'ADD_COURT_TURN',
          sessionId,
          turn: { actor: npc2, content: npc2Response },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '升堂通信失败，请重试。');
      } finally {
        setIsLoading(false);
      }
    },
    [state, dispatch]
  );

  const renderVerdict = useCallback(
    (sessionId: string, verdict: Verdict, arrestedNpcId?: NpcId) => {
      const session = state.courtHistory.find(s => s.id === sessionId);
      const participantNames = session?.participants
        .map(id => NPC_DEFINITIONS.find(n => n.id === id)?.name ?? id)
        .join('、') ?? '堂上二人';

      if (verdict === 'arrest' && arrestedNpcId) {
        // 陈四是真凶；刘万全是幕后黑手（收押也算正确）；其余均为冤枉
        const correctArrest = ['chen_si', 'liu_wanquan'];
        const isWrong = !correctArrest.includes(arrestedNpcId);
        if (isWrong) {
          // v2: 错误关押声望 -20（原 -15）
          dispatch({ type: 'CHANGE_CREDIBILITY', delta: -20 });
          dispatch({
            type: 'MAKE_ACCUSATION',
            accusation: {
              day: state.currentDay,
              accusedNpcId: arrestedNpcId,
              context: 'court',
              wasCorrect: false,
            },
          });
          // 被冤枉者信任 → 0
          dispatch({ type: 'UPDATE_NPC_TRUST', npcId: arrestedNpcId, delta: -100 });
          // 其他全部NPC信任 -10
          const otherNpcIds: NpcId[] = [
            'chen_si', 'qin_shi', 'liu_wanquan', 'zhou_fu', 'ma_liu',
            'song_wuzuo', 'li_mingde', 'wang_danian', 'sun_popo',
          ].filter(id => id !== arrestedNpcId) as NpcId[];
          for (const npcId of otherNpcIds) {
            dispatch({ type: 'UPDATE_NPC_TRUST', npcId, delta: -10 });
          }
        } else {
          dispatch({
            type: 'MAKE_ACCUSATION',
            accusation: {
              day: state.currentDay,
              accusedNpcId: arrestedNpcId,
              context: 'court',
              wasCorrect: true,
            },
          });
        }
        const arrestedName = NPC_DEFINITIONS.find(n => n.id === arrestedNpcId)?.name ?? arrestedNpcId;
        const logEntry: StoryLogEntry = {
          id: makeLogId(), day: state.currentDay, type: 'court',
          icon: '⚖️',
          title: `升堂完毕 · 收押${arrestedName}`,
          content: `传讯${participantNames}对质后，大人下令收押${arrestedName}。${isWrong ? '（冤判！声望 -20，各方信任大损）' : '（判断正确）'}`,
        };
        dispatch({ type: 'ADD_STORY_LOG', entry: logEntry });
      } else if (verdict === 'release') {
        // 释放：在堂NPC信任各 -5
        if (session) {
          for (const npcId of session.participants) {
            dispatch({ type: 'UPDATE_NPC_TRUST', npcId, delta: -5 });
          }
        }
        const logEntry: StoryLogEntry = {
          id: makeLogId(), day: state.currentDay, type: 'court',
          icon: '⚖️',
          title: '升堂完毕 · 证据不足释放',
          content: `传讯${participantNames}对质，共 ${session?.turns.length ?? 0} 轮陈词，证据不足暂时释放。`,
        };
        dispatch({ type: 'ADD_STORY_LOG', entry: logEntry });
      } else {
        const logEntry: StoryLogEntry = {
          id: makeLogId(), day: state.currentDay, type: 'court',
          icon: '⚖️',
          title: '升堂完毕 · 暂不定论',
          content: `传讯${participantNames}对质，共 ${session?.turns.length ?? 0} 轮陈词，暂不定论，继续调查。`,
        };
        dispatch({ type: 'ADD_STORY_LOG', entry: logEntry });
      }

      dispatch({ type: 'END_COURT', sessionId, verdict, arrestedNpcId });
    },
    [dispatch, state.currentDay, state.courtHistory]
  );

  // 只计玩家发言回合，NPC 回复不受限制
  const playerTurnCount = activeSession
    ? activeSession.turns.filter(t => t.actor === 'player').length
    : 0;
  const isForcedConclusion = activeSession != null && playerTurnCount >= COURT_MAX_TURNS;

  // 剩余追问次数（只计玩家发言）
  const turnsRemaining = Math.max(0, COURT_MAX_TURNS - playerTurnCount);

  return {
    activeSession,
    isLoading,
    error,
    startCourt,
    addPlayerTurn,
    renderVerdict,
    isForcedConclusion,
    turnsRemaining,
    courtMaxTurns: COURT_MAX_TURNS,
  };
}
