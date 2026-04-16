import { useState } from 'react';
import { useDeputy } from '../../hooks/useDeputy';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { LOCATIONS } from '../../data/case/locations';
import type { DeputyTaskDef } from '../../data/case/deputyTasks';
import './DeputyDispatch.css';

interface Props {
  onClose: () => void;
}

export function DeputyDispatch({ onClose }: Props) {
  const { dispatchDeputyByDef, canDispatch, activeTask, pendingResult, taskDefs } = useDeputy();
  const [selected, setSelected] = useState<DeputyTaskDef | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleDispatch = () => {
    if (!selected || !canDispatch) return;
    dispatchDeputyByDef(selected);
    setConfirmed(true);
  };

  const surveillanceTasks = taskDefs.filter(t => t.type === 'surveillance');
  const searchTasks = taskDefs.filter(t => t.type === 'search');

  // 已派出显示
  if (activeTask) {
    const targetNpcDef = activeTask.targetNpcId
      ? NPC_DEFINITIONS.find(n => n.id === activeTask.targetNpcId)
      : null;
    const targetLocDef = activeTask.targetLocationId
      ? LOCATIONS.find(l => l.id === activeTask.targetLocationId)
      : null;
    return (
      <div className="deputy-modal-overlay" onClick={onClose}>
        <div className="deputy-modal" onClick={e => e.stopPropagation()}>
          <div className="deputy-modal__header">
            <span>捕快出勤中</span>
            <button onClick={onClose}>✕</button>
          </div>
          <div className="deputy-modal__body">
            <div className="deputy-status">
              <div className="deputy-status__icon">🏃</div>
              <div className="deputy-status__text">
                <div className="deputy-status__task">{activeTask.instruction}</div>
                {targetNpcDef && <div className="deputy-status__target">目标：{targetNpcDef.name}</div>}
                {targetLocDef && <div className="deputy-status__target">地点：{targetLocDef.name}</div>}
                <div className="deputy-status__note">派出于第 {activeTask.dayDispatched} 天，明日归来复命。</div>
              </div>
            </div>
          </div>
          <div className="deputy-modal__footer">
            <button className="deputy-btn deputy-btn--cancel" onClick={onClose}>关闭</button>
          </div>
        </div>
      </div>
    );
  }

  // 昨日报告待读
  if (pendingResult && pendingResult.report) {
    return (
      <div className="deputy-modal-overlay" onClick={onClose}>
        <div className="deputy-modal deputy-modal--wide" onClick={e => e.stopPropagation()}>
          <div className="deputy-modal__header">
            <span>📋 捕快回报</span>
            <button onClick={onClose}>✕</button>
          </div>
          <div className="deputy-modal__body">
            <div className="deputy-report">
              <div className="deputy-report__label">调查报告</div>
              <div className="deputy-report__content">{pendingResult.report}</div>
              {pendingResult.evidenceUnlocked && (
                <div className="deputy-report__evidence">
                  ✦ 新线索已录入案卷
                </div>
              )}
            </div>
          </div>
          <div className="deputy-modal__footer">
            <button className="deputy-btn deputy-btn--confirm" onClick={onClose}>
              知晓了
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="deputy-modal-overlay" onClick={onClose}>
        <div className="deputy-modal" onClick={e => e.stopPropagation()}>
          <div className="deputy-modal__header">
            <span>已派出</span>
            <button onClick={onClose}>✕</button>
          </div>
          <div className="deputy-modal__body">
            <div className="deputy-status">
              <div className="deputy-status__icon">🏃</div>
              <div className="deputy-status__text">
                <div className="deputy-status__task">捕快已出发，明日回报。</div>
                <div className="deputy-status__note">今日不可再派差役。</div>
              </div>
            </div>
          </div>
          <div className="deputy-modal__footer">
            <button className="deputy-btn deputy-btn--cancel" onClick={onClose}>关闭</button>
          </div>
        </div>
      </div>
    );
  }

  const noTasks = surveillanceTasks.length === 0 && searchTasks.length === 0;

  return (
    <div className="deputy-modal-overlay" onClick={onClose}>
      <div className="deputy-modal deputy-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="deputy-modal__header">
          <span>派遣捕快</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="deputy-modal__body">
          {!canDispatch && (
            <div className="deputy-notice">今日已派出差役，请等待明日回报。</div>
          )}

          {noTasks && (
            <div className="deputy-notice">
              尚无可派遣的任务。先前往各地点、与相关人物交谈，才能掌握情况并安排调查。
            </div>
          )}

          {surveillanceTasks.length > 0 && (
            <div className="deputy-section">
              <div className="deputy-section__title">🔍 监视类</div>
              <div className="deputy-task-list">
                {surveillanceTasks.map(task => (
                  <button
                    key={task.id}
                    className={`deputy-task-card ${selected?.id === task.id ? 'deputy-task-card--selected' : ''}`}
                    onClick={() => canDispatch && setSelected(task)}
                    disabled={!canDispatch}
                  >
                    <div className="deputy-task-card__label">{task.label}</div>
                    <div className="deputy-task-card__desc">{task.description}</div>
                    {task.targetNpcId && (
                      <div className="deputy-task-card__target">
                        目标：{NPC_DEFINITIONS.find(n => n.id === task.targetNpcId)?.name ?? task.targetNpcId}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchTasks.length > 0 && (
            <div className="deputy-section">
              <div className="deputy-section__title">🗺 调查类</div>
              <div className="deputy-task-list">
                {searchTasks.map(task => (
                  <button
                    key={task.id}
                    className={`deputy-task-card ${selected?.id === task.id ? 'deputy-task-card--selected' : ''}`}
                    onClick={() => canDispatch && setSelected(task)}
                    disabled={!canDispatch}
                  >
                    <div className="deputy-task-card__label">{task.label}</div>
                    <div className="deputy-task-card__desc">{task.description}</div>
                    {task.targetLocationId && (
                      <div className="deputy-task-card__target">
                        地点：{LOCATIONS.find(l => l.id === task.targetLocationId)?.name ?? task.targetLocationId}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected && (
            <div className="deputy-selected-summary">
              已选：<strong>{selected.label}</strong> — {selected.description}
            </div>
          )}
        </div>

        <div className="deputy-modal__footer">
          <button className="deputy-btn deputy-btn--cancel" onClick={onClose}>取消</button>
          <button
            className="deputy-btn deputy-btn--confirm"
            onClick={handleDispatch}
            disabled={!selected || !canDispatch}
          >
            派出差役
          </button>
        </div>
      </div>
    </div>
  );
}
