import React from 'react';

import { TextFieldProps, TooltipProps } from '@material-ui/core';

import { IconName } from 'components/kit/Icon';

import { Override } from 'types/utils/common';

type IValidationPatternCondition = ((value: any) => boolean) | RegExp;

export type IValidationPattern = {
  errorCondition: IValidationPatternCondition;
  errorText: string;
};

export type IValidationPatterns = Array<IValidationPattern>;

export type ILabelAppearance = 'default' | 'top-labeled' | 'swap';

export type IMetadataMessage = {
  type: 'error' | 'warning' | 'success';
  text: string;
};

export type IMetadataMessages = Array<IMetadataMessage>;

export type IValidationMetadata = {
  isValid: boolean;
  messages: IMetadataMessages;
};

export type IInputProps = Override<
  TextFieldProps,
  {
    validationPatterns?: IValidationPatterns;
    labelAppearance?: ILabelAppearance;
    labelHelperText?: string;
    topLabeledIconName?: IconName;
    showMessageByTooltip?: boolean;
    size?: 'small' | 'medium' | 'large';
    isValidateInitially?: boolean;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      value: any,
      metadata: IValidationMetadata,
    ) => void;
    tooltipPlacement?: TooltipProps['placement'];
    wrapperClassName?: string;
    isRequiredNumberValue?: boolean;
    isNumberValueFloat?: boolean;
    isValid?: boolean;
    debounceDelay?: number;
  }
>;
