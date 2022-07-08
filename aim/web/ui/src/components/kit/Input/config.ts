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

const inputTypeConversionFns: {
  [key: string]: (value: any, requiredNumberValue?: boolean) => any;
} = {
  number: (value: any, requiredNumberValue?: boolean) => {
    const result = parseInt(value);
    return !isNaN(result) ? result : requiredNumberValue ? 0 : undefined;
  },
  text: (value: any) => `${value}`,
};

export { labelAppearances, inputSizes, inputTypeConversionFns };
