import { useMemo } from 'react';
import type { NotebookFilter } from '../types/notebook';
import { useGame } from '../state/GameContext';

export function useNotebook(filter: NotebookFilter = {}) {
  const { state, dispatch } = useGame();

  const filteredEntries = useMemo(() => {
    return state.notebookEntries.filter(entry => {
      if (filter.person && entry.speaker !== filter.person) return false;
      if (filter.category) {
        const hasCat = entry.claims.some(c => c.category === filter.category);
        if (!hasCat) return false;
      }
      if (filter.time) {
        const hasTime = entry.claims.some(
          c => c.relatedTime?.includes(filter.time!)
        );
        if (!hasTime) return false;
      }
      if (filter.location) {
        const hasLoc = entry.claims.some(
          c => c.relatedLocation?.includes(filter.location as string)
        );
        if (!hasLoc) return false;
      }
      if (filter.entryType) {
        if (entry.entryType !== filter.entryType) return false;
      }
      return true;
    });
  }, [state.notebookEntries, filter]);

  const bookmarkedEntries = useMemo(
    () => state.notebookEntries.filter(e => state.bookmarkedEntries.includes(e.id)),
    [state.notebookEntries, state.bookmarkedEntries]
  );

  const toggleBookmark = (entryId: string) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', entryId });
  };

  return {
    allEntries: state.notebookEntries,
    filteredEntries,
    bookmarkedEntries,
    toggleBookmark,
    isBookmarked: (id: string) => state.bookmarkedEntries.includes(id),
  };
}
