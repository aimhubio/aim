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
  [key: string]: ({
    value,
    isRequiredNumberValue,
    isNumberValueFloat,
  }: {
    value: any;
    isRequiredNumberValue?: boolean;
    isNumberValueFloat?: boolean;
  }) => string | number | undefined;
} = {
  number: ({ value, isRequiredNumberValue, isNumberValueFloat }) => {
    const result = isNumberValueFloat ? parseFloat(value) : parseInt(value);
    return !isNaN(result) ? result : isRequiredNumberValue ? 0 : undefined;
  },
  text: ({ value }) => `${value}`,
};

export { labelAppearances, inputSizes, inputTypeConversionFns };
