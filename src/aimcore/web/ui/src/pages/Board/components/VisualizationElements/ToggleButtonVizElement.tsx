import * as React from 'react';

import { Box, Text, ToggleButton } from 'components/kit_v2';

import generateId from 'utils/generateId';

function ToggleButtonVizElement(props: any) {
  const [value, setValue] = React.useState(props.options.value);

  React.useEffect(() => {
    if (props.options.value !== value) {
      setValue(props.options.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options.value]);

  const onChange = React.useCallback(
    (value: string) => {
      setValue(value);
      props.callbacks?.on_change(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
      <ToggleButton
        id={id}
        {...props.options}
        leftLabel={props.options.leftValue}
        rightLabel={props.options.rightValue}
        disabled={props.options.disabled}
        value={value}
        onChange={onChange}
      />
    </Box>
  );
}

export default ToggleButtonVizElement;
