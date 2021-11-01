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
    encodedParams.grouping = encode(grouping);
  }
  if (chart) {
    encodedParams.chart = encode(chart);
  }
  if (select) {
    encodedParams.select = encode(select);
  }

  updateUrlParam({ data: encodedParams, appName });
}
