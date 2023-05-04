import * as React from 'react';

import { Radio, RadioGroup, Text } from 'components/kit_v2';
import { RadioLabel } from 'components/kit_v2/Radio/Radio.style';

function RadioVizElement(props: any) {
  const [value, setValue] = React.useState<string>(props.value);

  const onChange = React.useCallback(
    (value: string) => {
      setValue(value);
      props.callbacks?.on_change(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const options = React.useMemo(
    () => props.options.options.map((option: string) => `${option}`),
    [props.options.options],
  );

  React.useEffect(() => {
    if (props.value !== value) {
      setValue(props.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  return (
    <RadioGroup
      onValueChange={onChange}
      value={value}
      disabled={props.options.disabled}
      defaultValue={props.options.defaultValue || undefined}
    >
      <RadioLabel htmlFor={value}>{props.options.label}</RadioLabel>
      {options.map((option: string) => (
        <Radio key={option} value={option}>
          <Text>{option}</Text>
        </Radio>
      ))}
    </RadioGroup>
  );
}
export default RadioVizElement;
