import React from 'react';

import { Icon } from 'components/kit';

import { styled } from 'config/stitches/stitches.config';

import { IInputProps } from './Input.d';

const Container = styled('div', {
  display: 'flex',
  fd: 'column',
  br: '$1',
  variants: {
    error: {
      true: {
        borderColor: '$red',
      },
    },
  },
});

const InputContainer = styled('input', {
  border: 'none',
  height: '100%',
  width: '100%',
  fontSize: '$3',
  br: '$1',
  color: '$textPrimary',
  pl: '$6',
  bs: '0px 0px 0px 1px $colors$secondary50',
  '&:focus': {
    outline: 'none',
    bs: '0px 0px 0px 1px $colors$primary100 !important',
  },
  '&:hover': {
    outline: 'none',
    bs: '0px 0px 0px 1px $colors$secondary100',
  },
});

const ClearButtonContainer = styled('div', {
  position: 'absolute',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$sizes$1',
  fontSize: '$fontSizes$2',
  cursor: 'pointer',
  '& > i': {
    display: 'flex',
    ai: 'center',
    jc: 'center',
    br: '$round',
    background: '$secondary20',
    size: '10px',
  },
});

const InputContent = styled('div', {
  display: 'flex',
  ai: 'center',
  br: '$1',
  position: 'relative',
  variants: {
    size: {
      medium: {
        height: '$sizes$3',
        '& > input': {
          pr: '$14',
        },
        [`& ${ClearButtonContainer}`]: {
          right: '$4',
        },
      },
      large: {
        height: '$sizes$5',
        '& > input': {
          pl: '$7',
          pr: '$15',
        },
        [`& ${ClearButtonContainer}`]: {
          right: '$5',
        },
      },
      xLarge: {
        height: '$sizes$7',
        '& > input': {
          pl: '$8',
          pr: '$16',
        },
        [`& ${ClearButtonContainer}`]: {
          right: '$6',
        },
      },
    },
  },
});

function Input({
  value,
  inputSize = 'medium',
  placeholder,
  error,
  onChange,
}: IInputProps): React.FunctionComponentElement<React.ReactNode> {
  const [inputValue, setInputValue] = React.useState<string>(value);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    setInputValue(value);
    onChange(value, event);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  React.useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  return (
    <Container error={error}>
      <InputContent size={inputSize}>
        <InputContainer
          placeholder={placeholder}
          onChange={handleChange}
          value={inputValue}
        />
        <ClearButtonContainer
          css={{ visibility: inputValue ? 'visible' : 'hidden' }}
          onClick={handleClear}
        >
          <Icon fontSize={5} name='close' />
        </ClearButtonContainer>
      </InputContent>
      {error && <div>{error}</div>}
    </Container>
  );
}

export default React.memo(Input);
