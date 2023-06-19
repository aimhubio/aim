import * as React from 'react';

import { Box, Select, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function SelectVizElement(props: any) {
  const options: { value: string; label: string }[] = (
    props.options.options || []
  ).map((option: string) => ({
    value: `${option}`,
    label: `${option}`,
  }));

  const onChange = (val: string) => {
    if (typeof props.callbacks?.on_change === 'function') {
      props.callbacks.on_change(val);
    }
  };

  const id = React.useMemo(
    () => `${props.options.isMulti ? 'multi_' : ''}select_${generateId()}`,
    [props.options.isMulti],
  );
  return (
    <Box display='flex' fd='column'>
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
      <Select
        key={id}
        multiple={props.options.isMulti}
        searchable
        disabled={props.options.disabled}
        value={props.options.value}
        popoverProps={{ align: 'start' }}
        options={[
          {
            group: '',
            options,
          },
        ]}
        onValueChange={onChange}
      />
    </Box>
  );
}

export default SelectVizElement;
