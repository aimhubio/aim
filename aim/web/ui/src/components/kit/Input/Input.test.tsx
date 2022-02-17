import _ from 'lodash-es';

import { render, fireEvent } from '@testing-library/react';

import InputWrapper from './Input';

// Test number type
describe('<InputWrapper /> -', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(
      <InputWrapper
        value={5}
        type='number'
        labelAppearance='top-labeled'
        size='small'
        label='test label'
        topLabeledIconName='circle-question'
        labelHelperText='Helper text for tooltip'
        showMessageByTooltip
        onChange={_.noop}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('onChange event works properly', () => {
    const min = 10;
    const max = 100;
    const zero = 0;
    let result: any = null;

    const minValidationPattern = {
      errorCondition: (value: any) => value < 10,
      errorText: `Value should be equal or greater then ${min}`,
    };

    const maxValidationPattern = {
      errorCondition: (value: any) => value > max,
      errorText: `Value should be equal or smaller then ${max}`,
    };

    const zeroValidationPattern = {
      errorCondition: (value: any) => value === zero,
      errorText: `Value can't be equal to ${zero}`,
    };

    const regexpEightValidationPattern = {
      errorCondition: new RegExp(/[8]/g),
      errorText: 'Value should not contain digit 8',
    };

    const { getByTestId } = render(
      <InputWrapper
        type='number'
        labelAppearance='top-labeled'
        size='small'
        label='test label'
        topLabeledIconName='circle-question'
        labelHelperText='Helper text for tooltip'
        showMessageByTooltip
        onChange={(e, value, metadata) => {
          result = metadata;
        }}
        validationPatterns={[
          regexpEightValidationPattern,
          minValidationPattern,
          maxValidationPattern,
          zeroValidationPattern,
        ]}
      />,
    );

    const input = getByTestId('inputWrapper') as HTMLInputElement;

    // Min validation pattern checking
    fireEvent.change(input, { target: { value: 9 } });
    expect(input.value).toBe('9');
    expect(result?.isValid).toBe(false);
    expect(result?.messages[0]?.text).toBe(minValidationPattern.errorText);

    // Max validation pattern checking
    fireEvent.change(input, { target: { value: 101 } });
    expect(result?.isValid).toBe(false);
    expect(result?.messages[0]?.text).toBe(maxValidationPattern.errorText);

    // Zero validation pattern checking
    fireEvent.change(input, { target: { value: 0 } });
    expect(result?.isValid).toBe(false);
    expect(result?.messages[0]?.text).toBe(minValidationPattern.errorText);
    expect(result?.messages[1]?.text).toBe(zeroValidationPattern.errorText);

    // Regexp validation pattern checking
    fireEvent.change(input, { target: { value: 18 } });
    expect(result?.isValid).toBe(false);
    expect(result?.messages[0]?.text).toBe(
      regexpEightValidationPattern.errorText,
    );
  });
});
