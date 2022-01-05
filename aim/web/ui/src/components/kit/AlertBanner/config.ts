import { ITypeMetadata } from './AlertBanner.d';

const warning: ITypeMetadata = {
  cssClassName: 'warning',
  iconName: 'TypeTriangle',
};

const info: ITypeMetadata = {
  cssClassName: 'info',
  iconName: 'Info_ic',
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
