import { IconName } from 'components/kit/Icon/Icon';

type AlertBannerType = 'warning' | 'info' | 'error' | 'success';

export interface IAlertBannerProps {
  children?: React.ReactNode;
  type: AlertBannerType;
  visibilityDuration?: number;
  isVisiblePermanently?: boolean;
}

export interface ITypeMetadata {
  cssClassName: string;
  iconName: IconName;
}
