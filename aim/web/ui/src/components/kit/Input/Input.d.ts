import { TextFieldProps } from '@material-ui/core';

import { IconName } from 'components/kit/Icon';

type IValidationScenarioCondition = ((value: any) => boolean) | RegExp;

export type IErrorMessage = string;

export type IErrorsMessages = Array<IErrorMessage> | null;

export type IValidationScenario = {
  errorCondition: IValidationScenarioCondition;
  errorText: string;
};

export type ILabelAppearance = 'default' | 'top-labeled' | 'swap';

export type IValidationResult = {
  isValid: boolean;
  errors: string[];
};

type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type IInputProps = Override<
  TextFieldProps,
  {
    validationPatterns?: Array<IValidationScenario>;
    labelAppearance?: ILabelAppearance;
    labelHelperText?: string;
    labelIconName?: IconName;
    showMessageByTooltip?: boolean;
    size?: 'small' | 'medium' | 'large';
    isValidateInitially?: boolean;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      value: any,
      metadata: object,
    ) => void;
  }
>;
