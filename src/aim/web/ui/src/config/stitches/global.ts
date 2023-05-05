export const globalStyles: {} = {
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    '&:focus-visible': {
      outline: 'none',
    },
  },
  'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },

  /* Firefox */
  'input[type=number]': {
    '-moz-appearance': 'textfield',
  },
};
