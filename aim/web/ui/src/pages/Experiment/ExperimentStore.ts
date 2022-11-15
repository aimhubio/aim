import {
  getExperimentById,
  getExperiments,
  updateExperimentById,
  IExperimentData,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

import * as analytics from 'services/analytics';

import { notificationContainerStore } from 'components/NotificationContainer';

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

  function updateExperiment(name: string, description: string) {
    const experimentData = experimentState.getState().data;
    updateExperimentById(
      { name, description, archived: experimentData?.archived },
      experimentData?.id || '',
    ).then((res) => {
      experimentState.setState((prev: any) => ({
        ...prev,
        data: { ...prev.data, name, description },
      }));
      if (res.id) {
        notificationContainerStore.onNotificationAdd({
          id: Date.now(),
          messages: ['Changes successfully saved'],
          severity: 'success',
        });
      } else {
        notificationContainerStore.onNotificationAdd({
          id: Date.now(),
          messages: ['Something went wrong'],
          severity: 'success',
        });
      }
      analytics.trackEvent('[Experiment] Edit Experiment name and description');
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
  };
}

export default experimentEngine();
