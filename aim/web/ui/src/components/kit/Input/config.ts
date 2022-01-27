const labelAppearances = {
  default: {
    cssClassName: 'default',
  },
  swap: {
    cssClassName: 'swap',
  },
  'top-labeled': {
    cssClassName: 'topLabeled',
  },
};

const inputSizes = {
  small: {
    cssClassName: 'small',
  },
  medium: {
    cssClassName: 'medium',
  },
  large: {
    cssClassName: 'large',
  },
};

const inputTypeConversionFns: { [key: string]: (value: any) => any } = {
  number: (value: any) => {
    const result = parseInt(value);
    return !isNaN(result) ? result : 0;
  },
  text: (value: any) => `${value}`,
};

export { labelAppearances, inputSizes, inputTypeConversionFns };
