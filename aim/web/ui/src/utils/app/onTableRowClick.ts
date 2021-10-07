import { IModel, State } from 'types/services/models/model';

export default function onTableRowClick<M extends State>({
  rowKey,
  model,
}: {
  rowKey?: string;
  model: IModel<M>;
}): void {
  const configData = model?.getState()!.config!;
  const chartPanelRef: any = model?.getState()?.refs?.chartPanelRef;
  let focusedStateActive = !!rowKey;
  if (
    configData.chart.focusedState.active &&
    configData.chart.focusedState.key === rowKey
  ) {
    focusedStateActive = false;
  }
  chartPanelRef?.current?.setActiveLineAndCircle(
    rowKey || configData?.chart?.focusedState?.key,
    focusedStateActive,
    true,
  );
}
