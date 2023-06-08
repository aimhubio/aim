import * as React from 'react';

import { Box, Radio, RadioGroup, Text } from 'components/kit_v2';

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

  return (
    <Box>
      {props.options.label && (
        <Text as='label' lineHeight={1.5} disabled={props.options.disabled}>
          {props.options.label}
        </Text>
      )}
      <RadioGroup
        orientation={props.options.orientation}
        onValueChange={onChange}
        value={value}
        disabled={props.options.disabled}
      >
        {options.map((option: string) => {
          return (
            <Radio
              id={`${props.component_key}_${option}`}
              key={option}
              value={option}
            >
              <Text>{option}</Text>
            </Radio>
          );
        })}
      </RadioGroup>
    </Box>
  );
}
export default RadioVizElement;
