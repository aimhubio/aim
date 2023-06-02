import * as React from 'react';

import { Box, Radio, RadioGroup, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function RadioVizElement(props: any) {
  const [value, setValue] = React.useState<string>(`${props.options.value}`);

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
    if (props.options.value !== value) {
      setValue(`${props.options.value}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options.value]);

  const id = React.useMemo(generateId, []);
  return (
    <Box>
      {props.options.label && (
        <Text
          as='label'
          htmlFor={id}
          lineHeight={1.5}
          disabled={props.options.disabled}
        >
          {props.options.label}
        </Text>
      )}
      <RadioGroup
        id={id}
        orientation={props.options.orientation}
        onValueChange={onChange}
        value={value}
        disabled={props.options.disabled}
      >
        {options.map((option: string) => (
          <Radio key={option} value={option}>
            <Text>{option}</Text>
          </Radio>
        ))}
      </RadioGroup>
    </Box>
  );
}
export default RadioVizElement;
