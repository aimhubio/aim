import { IPanelTooltip } from 'services/models/metrics/metricsAppModel';
import { IGroupingSelectOption } from 'services/models/imagesExplore/imagesExploreAppModel';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip: IPanelTooltip;
  onChangeTooltip: (tooltip: Partial<IPanelTooltip>) => void;
}
