import { IModel, State } from 'types/services/models/model';

export default function resetModelOnError<M extends State>(
  detail?: any,
  model?: IModel<M>,
) {
  model?.setState({
    data: [],
    params: [],
    lineChartData: [],
    aggregatedData: [],
    tableData: [],
    tableColumns: [],
    requestIsPending: false,
  });

  setTimeout(() => {
    const tableRef: any = model?.getState()?.refs?.tableRef;
    tableRef.current?.updateData({
      newData: [],
      newColumns: [],
    });
  }, 0);
}
