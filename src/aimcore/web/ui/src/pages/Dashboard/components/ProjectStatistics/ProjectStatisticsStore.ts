import createResource from 'modules/core/utils/createResource';
import {
  getProjectsInfo,
  GetProjectsInfoResult,
} from 'modules/core/api/projectApi';

import { SequenceType } from 'types/core/enums';

function projectStatisticsEngine() {
  const { fetchData, state, destroy } = createResource<GetProjectsInfoResult>(
    async () => {
      const data = await getProjectsInfo({
        sequence: [
          SequenceType.Metric,
          // SequenceType.Image,
          SequenceType.Figure,
          SequenceType.Text,
          SequenceType.Audio,
          SequenceType.Distribution,
        ],
        params: false,
      });
      return data.sequences;
    },
  );
  return { fetchProjectParams: fetchData, projectParamsState: state, destroy };
}

export default projectStatisticsEngine();
