import * as React from 'react';

import { Box, Checkbox, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function CheckboxVizElement(
  props: any,
): React.FunctionComponentElement<React.ReactNode> {
  const [checked, setChecked] = React.useState(props.options.value);

  React.useEffect(() => {
    if (props.options.value !== checked) {
      setChecked(props.options.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options.value]);

  const onChange = React.useCallback((checked) => {
    setChecked(checked);
    props.callbacks?.on_change(checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <Box display='flex' ai='center'>
        <Checkbox
          {...props.options}
          id={id}
          checked={checked}
          onCheckedChange={onChange}
        />
      </Box>
    </Box>
  );
}

CheckboxVizElement.displayName = 'CheckboxVizElement';
export default CheckboxVizElement;
