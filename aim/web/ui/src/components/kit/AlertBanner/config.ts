import { ITypeMetadata } from './AlertBanner.d';

const warning: ITypeMetadata = {
  cssClassName: 'warning',
  iconName: 'warning-contained',
};

const info: ITypeMetadata = {
  cssClassName: 'info',
  iconName: 'circle-info',
};

const error: ITypeMetadata = {
  cssClassName: 'error',
  iconName: 'close-circle',
};

const success: ITypeMetadata = {
  cssClassName: 'success',
  iconName: 'success-icon',
};

const typesMetadata = {
  warning,
  info,
  error,
  success,
};

export { typesMetadata };
