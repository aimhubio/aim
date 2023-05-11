import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { encode } from '../encoder/encoder';

import updateUrlParam from './updateUrlParam';

export default function updateURL({
  configData,
  appName,
}: {
  configData: IAppModelConfig;
  appName: string;
}) {
  const { grouping, chart, select } = configData || {};
  const encodedParams: { [key: string]: string } = {};

  if (grouping) {
    encodedParams.grouping = encode(grouping as {});
  }
  if (chart) {
    encodedParams.chart = encode(chart as {});
  }
  if (select) {
    encodedParams.select = encode(select as {});
  }

  updateUrlParam({ data: encodedParams, appName });
}
