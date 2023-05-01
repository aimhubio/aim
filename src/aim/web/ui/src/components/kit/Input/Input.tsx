import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { TextField, Tooltip } from '@material-ui/core';

import Icon from 'components/kit/Icon';
import Text from 'components/kit/Text';

import {
  IMetadataMessages,
  IMetadataMessage,
  IValidationPatterns,
  IInputProps,
  IValidationMetadata,
} from './Input.d';
import { labelAppearances, inputSizes, inputTypeConversionFns } from './config';

import './Input.scss';

/**
 * @property {boolean} isValidateInitially - flag for immediately validation of input. Default value is false.
 * @property {string} label - label for input.
 * @property {string} labelHelperText - helper text for input label.
 * @property {boolean} showMessageByTooltip - flag for showing any message by using tooltip instead of helper text.
 * @property {any} value - value prop for input component.
 * @property {IValidationPatterns} validationPatterns - validation patterns for validating input value. Ordering is meaningful validations pattern executor follow to order of props array.
 * @property {default | top-labeled | swap} labelAppearance - define of input component label type and position. Default value is default.
 * @property {IconName} topLabeledIconName - icon name for top label
 * @property {function} onChange - change handler function receives tree argument event, pure value, metadata for validation state and messages
 * @property {small | medium | large} size - define size of input component. Default value is medium.
 * @property {boolean} isRequiredNumberValue - define number input value required or not. Default value is true.
 * @property {boolean} isNumberValueFloat - define number input value type to float. Default value is false, mean type is integer.
 * @property {boolean} isValid - define input controlled validation, ability to change validation outside of the component.
 * @property {number} debounceDelay - add delay to input validation and change.
 */
function InputWrapper({
  isValidateInitially = false,
  labelAppearance = 'default',
  validationPatterns = [],
  label,
  labelHelperText,
  topLabeledIconName,
  showMessageByTooltip = false,
  type = 'text',
  value,
  onChange,
  size = 'medium',
  tooltipPlacement = 'left',
  wrapperClassName = '',
  isRequiredNumberValue = true,
  isNumberValueFloat = false,
  isValid,
  debounceDelay,
  ...restProps
}: IInputProps): React.FunctionComponentElement<React.ReactNode> {
  const [inputValue, setInputValue] = React.useState<string | number>();
  const [isInputValid, setIsInputValid] = React.useState<boolean>(true);
  const [errorsMessages, setErrorsMessages] = React.useState<IMetadataMessages>(
    [],
  );
  const [helperText, setHelperText] = React.useState<string>('');
  const [isMessageTooltipVisible, setIsMessageTooltipVisible] =
    React.useState<boolean>(false);

  const valueTypeConversionFn = React.useMemo(
    () => inputTypeConversionFns[type],
    [type],
  );

  const isDebounced = React.useMemo(
    () => !_.isUndefined(debounceDelay),
    [debounceDelay],
  );

  const validatePatterns = (
    validationPatterns: IValidationPatterns,
    newValue: any,
  ): IValidationMetadata => {
    const facedErrorsMessages: IMetadataMessages = validationPatterns
      .map(({ errorCondition, errorText }): IMetadataMessage => {
        let error: IMetadataMessage = { type: 'error', text: '' };
        if (_.isFunction(errorCondition)) {
          error.text = errorCondition(newValue) ? errorText : '';
        } else if (_.isRegExp(errorCondition)) {
          error.text = errorCondition.test(newValue) ? errorText : '';
        }
        return error;
      })
      .filter((error: IMetadataMessage) => !_.isEmpty(error.text));

    const isValid = _.isEmpty(facedErrorsMessages);
    setErrorsMessages(facedErrorsMessages);
    setIsInputValid(isValid);

    return {
      isValid,
      messages: [...facedErrorsMessages],
    };
  };

  const onValidateAndChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, newValue?: string | number) => {
      let metadata: IValidationMetadata = { isValid: true, messages: [] };
      if (!_.isEmpty(validationPatterns)) {
        metadata = validatePatterns(validationPatterns, newValue);
        setIsInputValid(metadata.isValid);
      }
      onChange && onChange(e, newValue, metadata);
    },
    [onChange, validationPatterns],
  );

  const debouncedValidateAndChange = React.useMemo(() => {
    return isDebounced
      ? _.debounce(onValidateAndChange, debounceDelay)
      : onValidateAndChange;
  }, [onValidateAndChange, isDebounced, debounceDelay]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = onParseAndChangeValue(e?.target?.value);
    debouncedValidateAndChange(e, newValue);
  };

  const onParseAndChangeValue = (value: unknown): typeof inputValue => {
    const newValue = valueTypeConversionFn({
      value,
      isRequiredNumberValue,
      isNumberValueFloat,
    });
    setInputValue(newValue);
    return newValue;
  };

  const messagesFormatter = (messages: IMetadataMessages): void => {
    const messagesLastIndex = _.size(messages) - 1;
    const formattedMessages: string =
      messages?.reduce((acc, message: IMetadataMessage, index) => {
        return (acc += `${message.text}${
          messagesLastIndex === index ? '.' : ',\n'
        }`);
      }, '') || '';

    setHelperText(formattedMessages);
  };

  React.useEffect(() => {
    messagesFormatter(errorsMessages);
  }, [errorsMessages]);

  React.useEffect(() => {
    if (!_.isUndefined(isValid)) {
      setIsInputValid(isValid);
    }
  }, [isValid]);

  React.useEffect(() => {
    if (value !== inputValue) {
      onChangeHandler({
        target: { value },
      } as React.ChangeEvent<HTMLInputElement>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    setIsMessageTooltipVisible(!isInputValid);
  }, [isInputValid]);

  React.useEffect(() => {
    if (isValidateInitially) {
      onChangeHandler({
        target: { value },
      } as React.ChangeEvent<HTMLInputElement>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRenderTopLabel = () => labelAppearance === 'top-labeled' && label;

  let dynamicProps: any = {};

  if (!showMessageByTooltip) {
    dynamicProps.helperText = helperText;
  }

  return (
    <div
      className={classNames(
        `InputWrapper InputWrapper_${labelAppearances[labelAppearance].cssClassName} InputWrapper_${inputSizes[size].cssClassName}`,
        {
          InputWrapper_error: !isInputValid,
          [wrapperClassName]: !!wrapperClassName,
        },
      )}
    >
      {isRenderTopLabel() && (
        <div className='InputWrapper_topLabelCnt'>
          <Text size={10} weight={400} tint={70} color='primary'>
            {label}:
          </Text>
          {!_.isUndefined(topLabeledIconName) &&
            !_.isUndefined(labelHelperText) && (
              <Tooltip title={labelHelperText} placement='right-end'>
                <div>
                  <Icon name={topLabeledIconName} />
                </div>
              </Tooltip>
            )}
        </div>
      )}

      <div
        className={`InputWrapper_textFieldCnt InputWrapper_textFieldCnt_${inputSizes[size].cssClassName}`}
      >
        <TextField
          inputProps={{ 'data-testid': 'inputWrapper' }}
          value={inputValue ?? ''}
          onChange={onChangeHandler}
          type={type}
          error={!isInputValid}
          label={label}
          variant='outlined'
          {...dynamicProps}
          {...restProps}
        />

        {showMessageByTooltip && isMessageTooltipVisible && (
          <Tooltip
            title={helperText}
            open={showMessageByTooltip && isMessageTooltipVisible}
            placement={tooltipPlacement}
            arrow
            classes={{
              tooltip: 'InputWrapper_textFieldCnt_tooltip_error',
              arrow: 'arrow',
            }}
          >
            <div />
          </Tooltip>
        )}
      </div>
    </div>
  );
}

InputWrapper.displayName = 'InputWrapper';

export default React.memo<IInputProps>(InputWrapper);
