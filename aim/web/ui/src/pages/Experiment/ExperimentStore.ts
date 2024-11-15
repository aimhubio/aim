import { notificationContainerStore } from 'components/NotificationContainer';

import {
  getExperimentById,
  getExperiments,
  updateExperimentById,
  deleteExperimentById,
  IExperimentData,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

import * as analytics from 'services/analytics';

function experimentEngine() {
  const {
    fetchData: fetchExperimentData,
    state: experimentState,
    destroy: destroyExperiment,
  } = createResource<IExperimentData>(getExperimentById);
  const {
    fetchData: fetchExperimentsData,
    state: experimentsState,
    destroy: destroyExperiments,
  } = createResource<IExperimentData[]>(getExperiments);

  function deleteExperiment() {
    const experimentData = experimentState.getState().data;
    if (!experimentData) return;
    destroyExperiment();
    destroyExperiments();
    experimentState.setState({ data: null });
    deleteExperimentById(experimentData.id)
      .then(() => {
        notificationContainerStore.onNotificationAdd({
          id: Date.now(),
          messages: ['Experiment successfully deleted'],
          severity: 'success',
        });
        analytics.trackEvent('[Experiment] Delete Experiment');
      })
      .catch((err) => {
        notificationContainerStore.onNotificationAdd({
          id: Date.now(),
          messages: [err.message || 'Something went wrong'],
          severity: 'error',
        });
      });
  }

  function updateExperiment(name: string, description: string) {
    const experimentData = experimentState.getState().data;
    updateExperimentById(
      { name, description, archived: experimentData?.archived },
      experimentData?.id || '',
    )
      .then(() => {
        experimentState.setState((prev: any) => ({
          data: { ...prev.data, name, description },
        }));
        notificationContainerStore.onNotificationAdd({
          id: Date.now(),
          messages: ['Changes successfully saved'],
          severity: 'success',
        });
        analytics.trackEvent(
          '[Experiment] Edit Experiment name and description',
        );
      })
      .catch((err) => {
        notificationContainerStore.onNotificationAdd({
          id: Date.now(),
          messages: [err.message || 'Something went wrong'],
          severity: 'error',
        });
      });
  }

  return {
    fetchExperimentData,
    experimentState,
    destroyExperiment,
    fetchExperimentsData,
    experimentsState,
    destroyExperiments,
    updateExperiment,
    deleteExperiment,
  };
}

export default experimentEngine();
