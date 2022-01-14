import { ITypeMetadata } from './AlertBanner.d';

const warning: ITypeMetadata = {
  cssClassName: 'warning',
  iconName: 'typeTriangle',
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
  iconName: 'successIcon',
};

const typesMetadata = {
  warning,
  info,
  error,
  success,
};

export { typesMetadata };
