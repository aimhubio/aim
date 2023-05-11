import {
  ITooltipConfig,
  TooltipAppearanceEnum,
} from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import { AimFlatObjectBaseRun } from 'types/core/AimObjects';

export interface ITooltipContentProps {
  tooltipAppearance?: TooltipAppearanceEnum;
  focused?: boolean;
  onChangeTooltip: (tooltipConfig: Partial<ITooltipConfig>) => void;
  run?: AimFlatObjectBaseRun;
  selectedProps?: Record<string, string | number>;
  selectedGroupingProps?: Record<string, any>;
  renderHeader?: Function;
}

export interface IAppearanceActionButtonsProps {
  appearance: TooltipAppearanceEnum;
  onChangeAppearance: (appearance: TooltipAppearanceEnum) => void;
}

export interface IRunAdditionalInfoProps {
  runHash?: string;
  experimentId?: string;
}

export interface ISelectedFieldsProps {
  fields?: Record<string, string | number>;
  isPopoverPinned?: boolean;
}

export interface ISelectedGroupingFieldsProps {
  fields?: Record<string, any>;
}
