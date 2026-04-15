import { useCallback } from 'react';
import { useGame } from '../state/GameContext';
import { canDispatchDeputy } from '../state/selectors';
import { DEPUTY_TASK_DEFS } from '../data/case/deputyTasks';
import type { DeputyTaskDef } from '../data/case/deputyTasks';

export function useDeputy() {
  const { state, dispatch } = useGame();

  /** 用预设任务定义派遣捕快 */
  const dispatchDeputyByDef = useCallback(
    (taskDef: DeputyTaskDef) => {
      if (!canDispatchDeputy(state)) return;
      dispatch({
        type: 'DISPATCH_DEPUTY',
        task: {
          id: `deputy_${Date.now()}`,
          dayDispatched: state.currentDay,
          type: taskDef.type,
          targetNpcId: taskDef.targetNpcId,
          targetLocationId: taskDef.targetLocationId,
          instruction: taskDef.label,
          taskDefId: taskDef.id,
          presetReport: taskDef.reportText,
          presetEvidence: taskDef.evidenceUnlocked,
        },
      });
    },
    [state, dispatch]
  );

  return {
    activeTask: state.deputyTaskActive,
    pendingResult: state.deputyResultPending,
    canDispatch: canDispatchDeputy(state),
    dispatchDeputyByDef,
    taskDefs: DEPUTY_TASK_DEFS,
  };
}
