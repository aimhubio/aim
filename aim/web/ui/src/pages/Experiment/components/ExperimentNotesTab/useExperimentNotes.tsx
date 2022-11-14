import React from 'react';

import experimentNotesEngine from './ExperimentNotesEngine';

function useExperimentNotes(experimentId: string) {
  const { current: engine } = React.useRef(experimentNotesEngine);

  const experimentNoteState = engine.experimentNoteState((state) => state);
  React.useEffect(() => {
    if (!experimentNoteState?.data?.[0]) {
      engine.fetchExperimentNote(experimentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  function onNoteCreate(note: { content: string }) {
    engine.createExperimentNote(experimentId, note.content);
  }

  function onNoteUpdate(note: { content: string }) {
    engine.updateExperimentNote(
      experimentId,
      `${experimentNoteState?.data?.[0]?.id}`,
      note.content,
    );
  }

  return {
    noteData: experimentNoteState?.data?.[0],
    isLoading: experimentNoteState.loading,
    onNoteCreate,
    onNoteUpdate,
  };
}

export default useExperimentNotes;
