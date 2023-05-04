import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IFacetGroupingProps extends IBaseComponentProps {
  facetGroupings: Record<string, any>;
  renderGrouping: ([key, grouping]: [string, any]) => JSX.Element;
}
