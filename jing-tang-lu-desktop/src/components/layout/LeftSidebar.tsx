import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { LOCATIONS } from '../../data/case/locations';
import { NPC_DEFINITIONS } from '../../data/case/npcDefinitions';
import { isLocationUnlocked, isNpcAvailable } from '../../state/selectors';
import { DeputyDispatch } from '../deputy/DeputyDispatch';
import './LeftSidebar.css';

export function LeftSidebar() {
  const { state, dispatch } = useGame();
  const [showDeputy, setShowDeputy] = useState(false);

  const handleLocationClick = (locationId: string) => {
    if (!isLocationUnlocked(locationId as never, state)) return;
    dispatch({ type: 'MOVE_TO_LOCATION', locationId: locationId as never });
  };

  const handleNpcClick = (npcId: string) => {
    if (state.actionPoints <= 0) return;
    if (!isNpcAvailable(npcId as never, state)) return;
    dispatch({ type: 'START_CONVERSATION', npcId: npcId as never });
  };

  return (
    <div className="left-sidebar">
      <div className="left-sidebar__section-title">地点 · 人物</div>

      <div className="left-sidebar__locations">
        {LOCATIONS.map(loc => {
          const unlocked = isLocationUnlocked(loc.id, state);
          const isActive = state.currentLocation === loc.id;
          const npcsHere = loc.npcIds.filter(id => {
            const npc = NPC_DEFINITIONS.find(n => n.id === id);
            return npc != null;
          });

          return (
            <div
              key={loc.id}
              className={`location-item ${isActive ? 'location-item--active' : ''} ${!unlocked ? 'location-item--locked' : ''}`}
              onClick={() => unlocked && handleLocationClick(loc.id)}
            >
              <div className="location-item__name">
                {loc.name}
                {!unlocked && <span className="location-item__lock">🔒</span>}
              </div>

              {isActive && unlocked && npcsHere.length > 0 && (
                <div className="location-item__npcs">
                  {npcsHere.map(npcId => {
                    const npcDef = NPC_DEFINITIONS.find(n => n.id === npcId);
                    if (!npcDef) return null;
                    const available = isNpcAvailable(npcId, state);
                    const isArrested = state.npcs[npcId]?.isArrested;

                    return (
                      <button
                        key={npcId}
                        className={`npc-btn ${!available ? 'npc-btn--unavailable' : ''} ${isArrested ? 'npc-btn--arrested' : ''}`}
                        onClick={e => { e.stopPropagation(); handleNpcClick(npcId); }}
                        disabled={!available || state.actionPoints <= 0}
                        title={isArrested ? '已收押' : !available ? '当前无法问询' : `问询${npcDef.name}`}
                      >
                        {npcDef.name}
                        <span className="npc-btn__title">{npcDef.title}</span>
                        {isArrested && <span className="tag tag--red" style={{ marginLeft: 4 }}>收押</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="left-sidebar__actions">
        <button
          className="action-btn"
          onClick={() => setShowDeputy(true)}
          disabled={state.deputyTaskActive !== null}
          title={state.deputyTaskActive ? '捕快正在执行任务中' : '派遣捕快'}
        >
          {state.deputyTaskActive ? '捕快出差中…' : '派遣捕快'}
        </button>
      </div>

      {showDeputy && <DeputyDispatch onClose={() => setShowDeputy(false)} />}
    </div>
  );
}
