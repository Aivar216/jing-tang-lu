import { useCallback, useMemo } from 'react';
import { useGame } from '../state/GameContext';
import { canDispatchDeputy } from '../state/selectors';
import { DEPUTY_TASK_DEFS } from '../data/case/deputyTasks';
import type { DeputyTaskDef } from '../data/case/deputyTasks';

export function useDeputy() {
  const { state, dispatch } = useGame();

  /** v3: 根据已接触过的NPC和地点动态过滤任务列表 */
  const availableTaskDefs = useMemo(() => {
    return DEPUTY_TASK_DEFS.filter(task => {
      // 如果没有接触要求，始终显示
      if (!task.requiresNpcContact && !task.requiresLocationVisit) return true;
      // 需要已接触过某NPC
      if (task.requiresNpcContact && !state.visitedNpcIds.includes(task.requiresNpcContact)) return false;
      // 需要已到访过某地点
      if (task.requiresLocationVisit && !state.visitedLocationIds.includes(task.requiresLocationVisit)) return false;
      return true;
    });
  }, [state.visitedNpcIds, state.visitedLocationIds]);

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
    taskDefs: availableTaskDefs,
  };
}
