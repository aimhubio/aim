import { RouteChildrenProps } from 'react-router-dom';
export interface IMetricProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<HTMLDivElement>;
  chartRef: React.RefObject<HTMLDivElement>;
  wrapperRef: React.RefObject<HTMLDivElement>;
  handleResize: () => void;
}
