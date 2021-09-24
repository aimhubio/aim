import { IModel, State } from 'types/services/models/model';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';

export default function onActivePointChange<M extends State>(
  activePoint: IActivePoint,
  focusedStateActive: boolean = false,
  model: IModel<M>,
): void {
  const { data, params, refs, config } = model.getState();
  const tableRef: any = refs?.tableRef;
  //   const tableData = getDataAsTableRows(
  //     data,
  //     activePoint.xValue,
  //     params,
  //     false,
  //     config,
  //   );
  //   if (tableRef) {
  //     tableRef.current?.updateData({
  //       newData: tableData.rows,
  //       dynamicData: true,
  //     });
  //     tableRef.current?.setHoveredRow?.(activePoint.key);
  //     tableRef.current?.setActiveRow?.(
  //       focusedStateActive ? activePoint.key : null,
  //     );
  //     if (focusedStateActive) {
  //       tableRef.current?.scrollToRow?.(activePoint.key);
  //     }
  //   }
  let configData = config;
  //   if (configData?.chart) {
  //     configData = {
  //       ...configData,
  //       chart: {
  //         ...configData.chart,
  //         focusedState: {
  //           active: focusedStateActive,
  //           key: activePoint.key,
  //           xValue: activePoint.xValue,
  //           yValue: activePoint.yValue,
  //           chartIndex: activePoint.chartIndex,
  //         },
  //         tooltip: {
  //           ...configData.chart.tooltip,
  //           content: filterTooltipContent(
  //             tooltipData[activePoint.key],
  //             configData?.chart.tooltip.selectedParams,
  //           ),
  //         },
  //       },
  //     };
  //   }

  model.setState({
    // tableData: tableData.rows,
    config: configData,
  });
}
