import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { IModel, State } from 'types/services/models/model';

export default function resetModelOnError<M extends State>({
  detail,
  model,
}: {
  detail?: any;
  model?: IModel<M>;
}) {
  // TODO set state correctly for any app model state
  model?.setState({
    data: [],
    params: [],
    lineChartData: [],
    aggregatedData: [],
    tableData: [],
    tableColumns: [],
    requestStatus: RequestStatusEnum.BadRequest,
  });

  setTimeout(() => {
    const tableRef: any = model?.getState()?.refs?.tableRef;
    if (tableRef?.current) {
      tableRef?.current?.updateData({
        newData: [],
        newColumns: [],
      });
    }
  }, 0);
}
