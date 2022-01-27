import { TextFieldProps } from '@material-ui/core';

import { IconName } from 'components/kit/Icon';

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

type Override<T1, T2> = Omit<T1, keyof T2> & T2;

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
  }
>;
