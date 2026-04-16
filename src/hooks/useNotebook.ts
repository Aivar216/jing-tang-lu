import { useMemo } from 'react';
import type { NotebookFilter } from '../types/notebook';
import { useGame } from '../state/GameContext';

export function useNotebook(filter: NotebookFilter = {}) {
  const { state, dispatch } = useGame();

  const filteredEntries = useMemo(() => {
    return state.notebookEntries.filter(entry => {
      if (filter.person && entry.speaker !== filter.person) return false;
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
