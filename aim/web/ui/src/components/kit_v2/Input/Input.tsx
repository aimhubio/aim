import React from 'react';

import { Icon } from 'components/kit';

import { styled } from 'config/stitches/stitches.config';

import { IInputProps } from './Input.d';

const Container = styled('div', {
  display: 'flex',
  fd: 'column',
});

const LeftIcon = styled(Icon, {
  position: 'absolute',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$sizes$1',
  color: '$textPrimary50',
  pointerEvents: 'none',
  variants: {
    size: {
      medium: {
        left: '$space$4',
      },
      large: {
        left: '$space$5',
      },
      xLarge: {
        left: '$space$6',
      },
    },
    focused: {
      true: {
        color: '$textPrimary !important',
      },
    },
    disabled: {
      true: {
        color: '$secondary30',
      },
    },
  },
});

const InputWrapper = styled('div', {
  position: 'relative',
  display: 'flex',
  ai: 'center',
  '&:hover': {
    [`& ${LeftIcon}`]: {
      color: '$secondary100',
    },
  },
  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: '$secondary30',
      },
    },
  },
});

const InputContainer: any = styled('input', {
  border: 'none',
  outline: 'none',
  height: '100%',
  width: '100%',
  color: '$textPrimary',
  bs: '0px 0px 0px 1px $colors$secondary50',
  br: '$3',
  fontSize: '$3',
  p: 0,
  '&::placeholder': {
    color: '$textPrimary50',
  },
  '&:hover': {
    bs: '0px 0px 0px 1px $colors$secondary100',
  },
  '&:focus': {
    bs: '0px 0px 0px 1px $colors$primary100',
  },
  variants: {
    leftIcon: { true: {} },
    size: {
      medium: {
        height: '$sizes$3',
        pl: '$6',
        pr: '$16',
      },
      large: {
        pl: '$7',
        pr: '$17',
        height: '$sizes$5',
      },
      xLarge: {
        pl: '$8',
        pr: '$18',
        height: '$sizes$7',
      },
    },
    error: {
      true: {
        bs: '0px 0px 0px 1px $colors$error100 !important',
      },
    },
    disabled: {
      true: {
        color: '$textPrimary50',
      },
    },
  },
  compoundVariants: [
    {
      leftIcon: true,
      size: 'medium',
      css: {
        pl: '$16',
      },
    },
    {
      leftIcon: true,
      size: 'large',
      css: {
        pl: '$17',
      },
    },
    {
      leftIcon: true,
      size: 'xLarge',
      css: {
        pl: '$18',
      },
    },
  ],
});

const ClearButtonContainer = styled('div', {
  position: 'absolute',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$sizes$1',
  cursor: 'pointer',
  '& .Icon__container': {
    display: 'flex',
    ai: 'center',
    jc: 'center',
    br: '$round',
    background: '$secondary20',
    color: '$textPrimary',
    size: '10px',
  },
  variants: {
    size: {
      medium: {
        right: '$4',
      },
      large: {
        right: '$5',
      },
      xLarge: {
        right: '$6',
      },
    },
  },
});

const Caption = styled('p', {
  fontSize: '$2',
  mt: '2px',
  color: '$textPrimary50',
  variants: {
    error: {
      true: {
        color: '$error100',
      },
    },
    disabled: {
      true: {
        color: '$secondary30',
      },
    },
  },
});

const Input = React.forwardRef<React.ElementRef<typeof Container>, IInputProps>(
  (
    {
      value,
      inputSize = 'medium',
      placeholder,
      error,
      inputElementProps = {},
      caption,
      errorMessage,
      leftIcon,
      disabled,
      onChange,
    }: IInputProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const [inputValue, setInputValue] = React.useState<string>(value);
    const [isFocused, setIsFocused] = React.useState<boolean>(false);

    React.useEffect(() => {
      if (value !== inputValue) {
        setInputValue(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        let { value } = event.target;
        setInputValue(value);
        onChange(value, event);
      },
      [onChange],
    );

    const handleClear = React.useCallback(() => {
      if (disabled) return;
      setInputValue('');
      onChange('');
    }, [disabled, onChange]);

    const onFocus = React.useCallback(() => {
      setIsFocused(true);
    }, []);

    const onBlur = React.useCallback(() => {
      setIsFocused(false);
    }, []);

    return (
      <Container ref={forwardedRef}>
        <InputWrapper disabled={disabled}>
          {leftIcon && (
            <LeftIcon
              className='LeftIcon'
              size={inputSize}
              fontSize={12}
              name={leftIcon}
              disabled={disabled}
              focused={!!inputValue || isFocused}
            />
          )}
          <InputContainer
            {...inputElementProps}
            size={inputSize}
            disabled={disabled}
            placeholder={placeholder}
            value={inputValue}
            error={error || !!errorMessage}
            leftIcon={!!leftIcon}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <ClearButtonContainer
            css={{ visibility: inputValue && !disabled ? 'visible' : 'hidden' }}
            onClick={handleClear}
            size={inputSize}
          >
            <Icon fontSize={4} name='close' />
          </ClearButtonContainer>
        </InputWrapper>
        {errorMessage || caption ? (
          <Caption disabled={disabled} error={error || !!errorMessage}>
            {errorMessage ? errorMessage : caption || ''}
          </Caption>
        ) : null}
      </Container>
    );
  },
);

export default React.memo(Input);
