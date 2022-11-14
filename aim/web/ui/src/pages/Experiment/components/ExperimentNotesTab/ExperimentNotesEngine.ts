import {
  createExperimentNote,
  getExperimentNote,
  GetExperimentNoteResult,
  updateExperimentNote,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

import notificationEngine from 'components/NotificationContainer/NotificationContainerStore';

function createExperimentNotesEngine() {
  const { fetchData, state, destroy } = createResource<GetExperimentNoteResult>(
    (experimentId: string) => getExperimentNote(experimentId),
  );

  return {
    fetchExperimentNote: (experimentId: string) => fetchData(experimentId),
    createExperimentNote: (experimentId: string, content: string) =>
      createExperimentNote(experimentId, { content }).then(() =>
        notificationEngine.onNotificationAdd({
          id: Date.now(),
          messages: ['Note successfully created'],
          severity: 'success',
        }),
      ),
    updateExperimentNote: (
      experimentId: string,
      noteId: string,
      content: string,
    ) => {
      updateExperimentNote(experimentId, noteId, { content }).then((res) => {
        state.setState((prev: any) => ({
          ...prev,
          data: [{ ...prev.data[0], updated_at: res.updated_at }],
        }));
        notificationEngine.onNotificationAdd({
          id: Date.now(),
          messages: ['Note successfully updated'],
          severity: 'success',
        });
      });
    },
    experimentNoteState: state,
    destroy,
  };
}

export default createExperimentNotesEngine();
