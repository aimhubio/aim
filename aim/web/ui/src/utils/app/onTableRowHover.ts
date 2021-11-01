import { IModel, State } from 'types/services/models/model';

export default function onTableRowHover<M extends State>({
  rowKey,
  model,
}: {
  rowKey?: string;
  model: IModel<M>;
}): void {
  const configData = model?.getState()?.config;
  if (configData?.chart) {
    const chartPanelRef: any = model?.getState()?.refs?.chartPanelRef;
    if (chartPanelRef && !configData.chart.focusedState.active) {
      chartPanelRef.current?.setActiveLineAndCircle(rowKey);
    }
  }
}
