import React from 'react';

import {
  Caption,
  Container,
  TextareaWrapper,
  TextareaContainer,
} from './Textarea.style';
import { ITextareaProps } from './Textarea.d';

const TextArea = React.forwardRef<
  React.ElementRef<typeof Container>,
  ITextareaProps
>(
  (
    {
      size = 'md',
      placeholder,
      error,
      caption,
      errorMessage,
      disabled,
      resize = 'none',
      css = {},
      ...props
    }: ITextareaProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const [TextareaValue, setTextareaValue] = React.useState<any>(
      props.value || '',
    );

    React.useEffect(() => {
      if (props.value !== TextareaValue) {
        setTextareaValue(props.value);
      }
    }, [props.value]);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        let { value } = event.target;
        setTextareaValue(value);
        if (props.onChange) {
          props.onChange(event);
        }
      },
      [props],
    );

    return (
      <Container css={css} ref={forwardedRef}>
        <TextareaWrapper disabled={disabled}>
          <TextareaContainer
            {...props}
            size={size}
            disabled={disabled}
            css={{ resize }}
            placeholder={placeholder}
            value={TextareaValue}
            error={error || !!errorMessage}
            onChange={handleChange}
          />
        </TextareaWrapper>
        {errorMessage || caption ? (
          <Caption disabled={disabled} error={error || !!errorMessage}>
            {errorMessage ? errorMessage : caption || ''}
          </Caption>
        ) : null}
      </Container>
    );
  },
);

TextArea.displayName = 'TextArea';

export default TextArea;
