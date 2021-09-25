import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';
import { IOnTableResizeEndParams } from 'types/utils/app/onTableResizeEnd';
import { State } from 'types/services/models/model';

export function onTableResizeEnd<M extends State>(
  params: IOnTableResizeEndParams<M>,
): void {
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
