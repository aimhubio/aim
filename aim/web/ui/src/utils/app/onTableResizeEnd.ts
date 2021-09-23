import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';
import { IOnTableResizeEndParams } from 'types/utils/app/onTableResizeEnd';

export function onTableResizeEnd(params: IOnTableResizeEndParams): void {
  const configData = params.model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      height: params.tableHeight,
    };
    const config = {
      ...configData,
      table,
    };
    params.model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
  }
}
