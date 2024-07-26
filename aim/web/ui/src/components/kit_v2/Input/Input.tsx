import React from 'react';

import { IconX } from '@tabler/icons-react';

import Icon from 'components/kit_v2/Icon';

import { IInputProps } from './Input.d';
import {
  Caption,
  ClearButtonContainer,
  Container,
  InputContainer,
  InputWrapper,
  LeftIcon,
} from './Input.style';

/**
 * @description Input component
 * Input component params
 * @param {string} value - Value of the input
 * @param {string} inputSize - Size of the input
 * @param {string} placeholder - Placeholder of the input
 * @param {boolean} error - Error state of the input
 * @param {object} inputElementProps - Props of the input element
 * @param {string} caption - Caption of the input
 * @param {string} errorMessage - Error message of the input
 * @param {string} leftIcon - Left icon of the input
 * @param {boolean} disabled - Disabled state of the input
 * @param {function} onChange - On change callback of the input
 * @returns {React.FunctionComponentElement<React.ReactNode>} - React component
 * @example
 * <Input value={value} inputSize="md" placeholder="Placeholder" error={false} inputElementProps={{}} caption="Caption" errorMessage="Error message" leftIcon={IconName} disabled={false} onChange={onChange} />
 */
const Input = React.forwardRef<React.ElementRef<typeof Container>, IInputProps>(
  (
    {
      inputSize = 'md',
      placeholder,
      error,
      caption,
      errorMessage,
      leftIcon,
      disabled,
      css = {},
      ...props
    }: IInputProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const [inputValue, setInputValue] = React.useState<any>(props.value || '');
    const [isFocused, setIsFocused] = React.useState<boolean>(false);

    React.useEffect(() => {
      if (props.value !== inputValue) {
        setInputValue(props.value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value]);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        let { value } = event.target;
        setInputValue(value);
        if (props.onChange) {
          props.onChange(event);
        }
      },
      [props],
    );

    const handleClear = React.useCallback(() => {
      if (disabled) return;
      setInputValue('');
      if (props.onChange) {
        props.onChange({
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }, [disabled, props]);

    const onFocus = React.useCallback(() => {
      setIsFocused(true);
    }, []);

    const onBlur = React.useCallback(() => {
      setIsFocused(false);
    }, []);

    return (
      <Container css={css} ref={forwardedRef}>
        <InputWrapper disabled={disabled}>
          {leftIcon && (
            <LeftIcon
              size='md'
              className='LeftIcon'
              inputSize={inputSize}
              icon={leftIcon}
              disabled={disabled}
              focused={!!inputValue || isFocused}
            />
          )}
          <InputContainer
            {...props}
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
            <Icon className='Icon__container' size='md' icon={<IconX />} />
          </ClearButtonContainer>
        </InputWrapper>
        {errorMessage || caption ? (
          <Caption error={error || !!errorMessage}>
            {errorMessage ? errorMessage : caption || ''}
          </Caption>
        ) : null}
      </Container>
    );
  },
);

Input.displayName = 'Input';
export default React.memo(Input);
