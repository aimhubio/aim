import React from 'react';

import experimentNotesEngine from './ExperimentNotesEngine';

function useExperimentNotes(experimentId: string) {
  const { current: engine } = React.useRef(experimentNotesEngine);

  const experimentContributionsState = engine.experimentNoteState(
    (state) => state,
  );
  React.useEffect(() => {
    engine.fetchExperimentNote(experimentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  function onNoteCreate(note: { content: string }) {
    engine.createExperimentNote(experimentId, note.content);
  }

  function onNoteUpdate(note: { content: string }) {
    engine.updateExperimentNote(
      experimentId,
      `${experimentContributionsState?.data?.[0]?.id}`,
      note.content,
    );
  }

  return {
    noteData: experimentContributionsState?.data?.[0],
    isLoading: experimentContributionsState.loading,
    onNoteCreate,
    onNoteUpdate,
  };
}

export default useExperimentNotes;
