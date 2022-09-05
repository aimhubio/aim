import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

export interface IImageFullViewPopoverProps {
  imageData: IImageData;
  tooltipContent: ITooltipContent;
  handleClose: () => void;
  selectOptions: IGroupingSelectOption[];
  imageRendering: string;
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
}
