import createResource from 'modules/core/utils/createResource';
import { getParams, GetParamsResult } from 'modules/core/api/projectApi';

import { SequenceTypesEnum } from 'types/core/enums';

function projectStatisticsEngine() {
  const { fetchData, state, destroy } = createResource<GetParamsResult>(() =>
    getParams({
      sequence: [
        SequenceTypesEnum.Metric,
        SequenceTypesEnum.Images,
        SequenceTypesEnum.Figures,
        SequenceTypesEnum.Texts,
        SequenceTypesEnum.Audios,
        SequenceTypesEnum.Distributions,
      ],
      exclude_params: true,
    }),
  );
  return { fetchProjectParams: fetchData, projectParamsState: state, destroy };
}

export default projectStatisticsEngine();
