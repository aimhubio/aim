import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { TextField, Tooltip } from '@material-ui/core';

import { Text, Icon } from 'components/kit';

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
  restInputProps = {},
  tooltipPlacement = 'left',
  wrapperClassName = '',
  ...restProps
}: IInputProps): React.FunctionComponentElement<React.ReactNode> {
  const [isInputValid, setIsInputValid] = React.useState(true);
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

  const isControlled = React.useMemo(() => !_.isUndefined(value), [value]);

  const validatePatterns = (
    validationPatterns: IValidationPatterns,
    value: any,
  ): IValidationMetadata => {
    const facedErrorsMessages: IMetadataMessages = validationPatterns
      .map(({ errorCondition, errorText }): IMetadataMessage => {
        let error: IMetadataMessage = { type: 'error', text: '' };

        if (_.isFunction(errorCondition)) {
          error.text = errorCondition(value) ? errorText : '';
        } else if (_.isRegExp(errorCondition)) {
          error.text = errorCondition.test(value) ? errorText : '';
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

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = valueTypeConversionFn(e?.target?.value);
    let metadata: any = {};

    if (!_.isEmpty(validationPatterns)) {
      const validationResult: IValidationMetadata = validatePatterns(
        validationPatterns,
        newValue,
      );

      metadata = validationResult;
    }

    onChange && onChange(e, newValue, metadata);
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
    isControlled &&
      onChangeHandler({
        target: { value },
      } as React.ChangeEvent<HTMLInputElement>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isRenderTopLabel = () => labelAppearance === 'top-labeled' && label;

  React.useEffect(() => {
    if (isValidateInitially) {
      onChangeHandler({
        target: { value },
      } as React.ChangeEvent<HTMLInputElement>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setIsMessageTooltipVisible(!isInputValid);
  }, [isInputValid]);

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
          inputProps={{ 'data-testid': 'inputWrapper', ...restInputProps }}
          value={value}
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
