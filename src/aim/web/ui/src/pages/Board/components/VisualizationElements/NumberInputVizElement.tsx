import * as React from 'react';

import { Input, Text } from 'components/kit_v2';

function NumberInputVizElement(props: any) {
  const [value, setValue] = React.useState(props.options.value);
  const [error, setError] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const { min, max } = props.options;

  const onChange = React.useCallback(
    ({ target }) => {
      setValue(target.value);

      const { err } = validate(target.value, min, max);
      if (!err) {
        props.callbacks?.on_change(Number(target.value));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max],
  );

  React.useEffect(() => {
    setValue(props.options.value);
  }, [props.options.value]);

  React.useEffect(() => {
    const { err, errMsg } = validate(value, min, max);
    setError(err);
    setErrorMsg(errMsg);
  }, [value, min, max]);

  const id = React.useMemo(() => `number_input_${Date.now()}}`, []);
  return (
    <div>
      {props.options.label && (
        <Text as='label' htmlFor={id} disabled={props.options.disabled}>
          {props.options.label}
        </Text>
      )}
      <Input
        id={id}
        type='number'
        value={value}
        min={props.options.min}
        max={props.options.max}
        step={props.options.step}
        disabled={props.options.disabled}
        onChange={onChange}
        error={error}
        errorMessage={errorMsg}
      />
    </div>
  );
}

export default NumberInputVizElement;

function validate(value: number = NaN, min: number = NaN, max: number = NaN) {
  const num_value = Number(value);
  const num_min = Number(min);
  const num_max = Number(max);

  if (isNaN(num_value)) {
    return { err: true, errMsg: 'Value must be a number' };
  }
  if (isNaN(num_min) && isNaN(num_max)) {
    return { err: false, errMsg: '' };
  }
  if (!isNaN(num_min) && isNaN(num_max)) {
    let err = num_value < num_min;
    let errMsg = '';
    if (err) {
      errMsg = 'Value must be greater than ' + num_min;
    }
    return { err, errMsg };
  }
  if (isNaN(num_min) && !isNaN(num_max)) {
    let err = num_value > num_max;
    let errMsg = '';
    if (err) {
      errMsg = 'Value must be less than ' + num_max;
    }
    return { err, errMsg };
  }

  if (num_value < num_min || num_value > num_max) {
    return {
      err: true,
      errMsg: 'Value must be between ' + num_min + ' and ' + num_max,
    };
  }

  return { err: false, errMsg: '' };
}
