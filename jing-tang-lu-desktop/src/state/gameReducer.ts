import type { GameState, GameAction } from '../types/game';
import { EVIDENCE_DEFINITIONS } from '../data/case/evidenceDefinitions';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_CONVERSATION': {
      if (state.actionPoints <= 0) return state;
      const alreadyVisitedNpc = state.visitedNpcIds.includes(action.npcId);
      return {
        ...state,
        gamePhase: 'investigation',
        activeConversationNpc: action.npcId,
        actionPoints: state.actionPoints - 1,
        visitedNpcIds: alreadyVisitedNpc
          ? state.visitedNpcIds
          : [...state.visitedNpcIds, action.npcId],
      };
    }

    case 'SEND_MESSAGE': {
      const npc = state.npcs[action.npcId];
      return {
        ...state,
        npcs: {
          ...state.npcs,
          [action.npcId]: {
            ...npc,
            conversationHistory: [
              ...npc.conversationHistory,
              { role: 'user', content: action.playerMessage },
              { role: 'assistant', content: action.npcResponse },
            ],
          },
        },
      };
    }

    case 'END_CONVERSATION': {
      const newState: GameState = {
        ...state,
        gamePhase: 'investigation',
        activeConversationNpc: null,
      };
      if (action.entry) {
        newState.notebookEntries = [...state.notebookEntries, action.entry];
      }
      return newState;
    }

    case 'ADD_NOTEBOOK_ENTRY': {
      return {
        ...state,
        notebookEntries: [...state.notebookEntries, action.entry],
      };
    }

    case 'MOVE_TO_LOCATION': {
      const alreadyVisitedLoc = state.visitedLocationIds.includes(action.locationId);
      return {
        ...state,
        currentLocation: action.locationId,
        activeConversationNpc: null,
        visitedLocationIds: alreadyVisitedLoc
          ? state.visitedLocationIds
          : [...state.visitedLocationIds, action.locationId],
      };
    }

    case 'ADVANCE_DAY': {
      const nextDay = state.currentDay + 1;
      const activeTask = state.deputyTaskActive;
      return {
        ...state,
        currentDay: nextDay,
        currentPeriod: 'morning',
        actionPoints: 3,
        gamePhase: 'investigation',
        // evidenceFoundToday 不在此重置，在 confirmDayStart 时重置
        deputyTaskActive: null,
        deputyResultPending: activeTask
          ? {
              taskId: activeTask.id,
              dayReturned: nextDay,
              report: activeTask.presetReport ?? '捕快归来，未发现异常。',
              evidenceUnlocked: activeTask.presetEvidence,
            }
          : null,
      };
    }

    case 'ADD_EVIDENCE': {
      if (state.evidenceFound.includes(action.evidenceId)) return state;
      // 自动同步：将物证录入案卷
      const evDef = EVIDENCE_DEFINITIONS.find(e => e.id === action.evidenceId);
      const autoEntry = evDef ? {
        id: `evidence_auto_${action.evidenceId}`,
        sourceLabel: evDef.sourceLabel ?? '现场勘查',
        day: state.currentDay,
        period: state.currentPeriod,
        claims: [{
          id: `claim_ev_${action.evidenceId}`,
          content: evDef.description,
          category: 'object' as const,
        }],
        rawDialogueSummary: evDef.title,
        entryType: (evDef.entryType ?? 'physical') as 'physical' | 'observation',
      } : null;
      // 避免重复（如已有相同 id 的条目）
      const alreadyInNotebook = state.notebookEntries.some(e => e.id === `evidence_auto_${action.evidenceId}`);
      return {
        ...state,
        evidenceFound: [...state.evidenceFound, action.evidenceId],
        evidenceFoundToday: state.evidenceFoundToday + 1,
        notebookEntries: autoEntry && !alreadyInNotebook
          ? [...state.notebookEntries, autoEntry]
          : state.notebookEntries,
      };
    }

    case 'UPDATE_NPC_TRUST': {
      const npc = state.npcs[action.npcId];
      const newTrust = Math.max(0, Math.min(100, npc.trust + action.delta));
      return {
        ...state,
        npcs: {
          ...state.npcs,
          [action.npcId]: { ...npc, trust: newTrust },
        },
      };
    }

    case 'SET_NPC_FLAG': {
      const npc = state.npcs[action.npcId];
      return {
        ...state,
        npcs: {
          ...state.npcs,
          [action.npcId]: {
            ...npc,
            flags: { ...npc.flags, [action.flag]: action.value },
          },
        },
      };
    }

    case 'DISPATCH_DEPUTY': {
      return {
        ...state,
        deputyTaskActive: action.task,
      };
    }

    case 'RESOLVE_DEPUTY': {
      const newState: GameState = {
        ...state,
        deputyResultPending: action.result,
      };
      if (action.result.evidenceUnlocked && !state.evidenceFound.includes(action.result.evidenceUnlocked)) {
        newState.evidenceFound = [...state.evidenceFound, action.result.evidenceUnlocked];
      }
      return newState;
    }

    case 'START_COURT': {
      if (state.courtSessionsRemaining <= 0) return state;
      const sessionId = `court_day${state.currentDay}_${Date.now()}`;
      const newSession = {
        id: sessionId,
        day: state.currentDay,
        participants: action.participants,
        turns: [],
        verdict: null,
        isActive: true,
      };
      return {
        ...state,
        gamePhase: 'court',
        courtSessionsRemaining: state.courtSessionsRemaining - 1,
        courtHistory: [...state.courtHistory, newSession],
      };
    }

    case 'ADD_COURT_TURN': {
      return {
        ...state,
        courtHistory: state.courtHistory.map(s =>
          s.id === action.sessionId
            ? { ...s, turns: [...s.turns, action.turn] }
            : s
        ),
      };
    }

    case 'END_COURT': {
      const updatedHistory = state.courtHistory.map(s =>
        s.id === action.sessionId
          ? { ...s, verdict: action.verdict, arrestedNpcId: action.arrestedNpcId, isActive: false }
          : s
      );
      let newNpcs = state.npcs;
      if (action.verdict === 'arrest' && action.arrestedNpcId) {
        newNpcs = {
          ...state.npcs,
          [action.arrestedNpcId]: {
            ...state.npcs[action.arrestedNpcId],
            isArrested: true,
          },
        };
      }
      return {
        ...state,
        gamePhase: 'investigation',
        courtHistory: updatedHistory,
        npcs: newNpcs,
      };
    }

    case 'TOGGLE_BOOKMARK': {
      const isBookmarked = state.bookmarkedEntries.includes(action.entryId);
      return {
        ...state,
        bookmarkedEntries: isBookmarked
          ? state.bookmarkedEntries.filter(id => id !== action.entryId)
          : [...state.bookmarkedEntries, action.entryId],
      };
    }

    case 'TRIGGER_LAYER2': {
      return {
        ...state,
        layer2Triggered: true,
        layer2TriggerMethod: action.method,
      };
    }

    case 'MAKE_ACCUSATION': {
      return {
        ...state,
        accusationsMade: [...state.accusationsMade, action.accusation],
        // 声望扣除由调用方通过 CHANGE_CREDIBILITY 显式发起，此处不重复扣
      };
    }

    case 'CHANGE_CREDIBILITY': {
      return {
        ...state,
        credibilityScore: Math.max(0, Math.min(100, state.credibilityScore + action.delta)),
      };
    }

    case 'ADVANCE_TUTORIAL': {
      return {
        ...state,
        tutorialStep: state.tutorialStep + 1,
      };
    }

    case 'SET_PHASE': {
      return {
        ...state,
        gamePhase: action.phase,
        // 离开日终界面时重置当日证据计数
        evidenceFoundToday: state.gamePhase === 'day_end' && action.phase === 'investigation'
          ? 0
          : state.evidenceFoundToday,
      };
    }

    case 'ADD_STORY_LOG': {
      return {
        ...state,
        storyLog: [...state.storyLog, action.entry],
      };
    }

    case 'ADD_CONFLICT_RECORD': {
      return {
        ...state,
        conflictRecords: [...state.conflictRecords, action.record],
      };
    }

    case 'USE_PRESSURE': {
      const current = state.pressureUsed[action.npcId] ?? 0;
      return {
        ...state,
        pressureUsed: {
          ...state.pressureUsed,
          [action.npcId]: Math.min(current + 1, 2),
        },
      };
    }

    case 'SET_NPC_ALERTED': {
      return {
        ...state,
        npcAlerted: { ...state.npcAlerted, [action.npcId]: true },
      };
    }

    default:
      return state;
  }
}
