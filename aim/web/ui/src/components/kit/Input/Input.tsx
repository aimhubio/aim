import React, { useEffect, useMemo, useState } from 'react';
import {
  isEmpty,
  isFunction,
  isRegExp,
  isUndefined,
  size as collectionSize,
} from 'lodash';
import classNames from 'classnames';

import { TextField, Tooltip } from '@material-ui/core';

import { Text, Icon } from 'components/kit';

import {
  IErrorMessage,
  IErrorsMessages,
  IValidationScenario,
  IInputProps,
  IValidationResult,
} from './Input.d';
import { labelAppearances, inputSizes, inputTypeConversionFns } from './config';

import './Input.scss';

/** @TODO describe all props with right types
 * @property {boolean} isValidateInitially - flag for immediately validation of input
 * @property {string} label - label for input
 * @property {string} labelHelperText - helper text for input label
 * @property {boolean} showMessageByTooltip - flag for showing any message by using tooltip instead of helper text
 * @property {any} value - value prop for input component
 */
function InputWrapper({
  isValidateInitially = false, // TODO TBD default value true or false
  labelAppearance = 'default',
  validationPatterns = [],
  label,
  labelHelperText,
  labelIconName,
  showMessageByTooltip = false,
  type = 'text',
  value,
  onChange,
  size = 'medium',
  ...restProps
}: IInputProps): React.FunctionComponentElement<React.ReactNode> {
  const [isInputValid, setIsInputValid] = useState(true);
  const [errorsMessages, setErrorsMessages] = useState<IErrorsMessages>(null);
  const [helperText, setHelperText] = useState<string>('');
  const [isMessageTooltipVisible, setIsMessageTooltipVisible] =
    useState<boolean>(false);

  const valueTypeConversionFn = useMemo(
    () => inputTypeConversionFns[type],
    [type],
  );

  const validateScenarios = (
    validationPatterns: Array<IValidationScenario>,
    value: any,
  ): IValidationResult => {
    const facedErrorsMessages: IErrorsMessages = validationPatterns
      // TODO use filter instead of map
      .map(({ errorCondition, errorText }): IErrorMessage => {
        let error: IErrorMessage = '';

        if (isFunction(errorCondition)) {
          error = errorCondition(value) ? errorText : '';
        } else if (isRegExp(errorCondition)) {
          error = errorCondition.test(value) ? errorText : '';
        }

        return error;
      })
      .filter((error: IErrorMessage) => !isEmpty(error)); // TODO remove after replacing map to filter

    const isValid = isEmpty(facedErrorsMessages);
    setErrorsMessages(facedErrorsMessages);
    setIsInputValid(isValid);

    return {
      isValid,
      errors: facedErrorsMessages,
    };
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = valueTypeConversionFn(e?.target?.value);
    let metadata: any = {};

    if (!isEmpty(validationPatterns)) {
      const validationResult: IValidationResult = validateScenarios(
        validationPatterns,
        newValue,
      );

      metadata = validationResult;
    }

    onChange && onChange(e, newValue, metadata);
  };

  const errorsMessagesFormatter = (
    errorsMessages: Array<string> | null,
  ): void => {
    const errorsMessagesLastIndex = collectionSize(errorsMessages) - 1;
    const formattedErrorMessages: string =
      errorsMessages?.reduce((acc, value, index) => {
        return (acc += `${value}${
          errorsMessagesLastIndex === index ? '.' : ',\n'
        }`);
      }, '') || '';

    setHelperText(formattedErrorMessages);
  };

  useEffect(() => {
    errorsMessagesFormatter(errorsMessages);
  }, [errorsMessages]);

  const isRenderTopLabel = () => labelAppearance === 'top-labeled' && label;

  useEffect(() => {
    if (isValidateInitially) {
      validateScenarios(validationPatterns, value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
        },
      )}
    >
      {isRenderTopLabel() && (
        <div className='InputWrapper_topLabelCnt'>
          <Text size={10} weight={400} tint={70} color='primary'>
            {label}:
          </Text>

          {!isUndefined(labelIconName) && !isUndefined(labelHelperText) && (
            <Tooltip title={labelHelperText} placement='right-end'>
              <div>
                <Icon name={labelIconName} />
              </div>
            </Tooltip>
          )}
        </div>
      )}

      <div
        className={`InputWrapper_textFieldCnt InputWrapper_textFieldCnt_${inputSizes[size].cssClassName}`}
      >
        <TextField
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
            placement='left'
            arrow
            classes={{
              tooltip: 'InputWrapper_textFieldCnt_tooltip_error',
              arrow: 'arrow',
            }}
          >
            <div></div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

InputWrapper.displayName = 'InputWrapper';

export default React.memo<IInputProps>(InputWrapper);
