import React from 'react';

import { Icon } from 'components/kit';

import { IInputProps } from './Input.d';
import {
  Caption,
  ClearButtonContainer,
  Container,
  InputContainer,
  InputWrapper,
  LeftIcon,
} from './Input.style';

const Input = React.forwardRef<React.ElementRef<typeof Container>, IInputProps>(
  (
    {
      value,
      inputSize = 'md',
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
