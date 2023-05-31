import * as React from 'react';

import { Box, Checkbox, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function CheckboxVizElement(
  props: any,
): React.FunctionComponentElement<React.ReactNode> {
  const [checked, setChecked] = React.useState(props.value);

  React.useEffect(() => {
    if (props.value !== checked) {
      setChecked(props.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);

  const onChange = React.useCallback((checked) => {
    setChecked(checked);
    props.callbacks?.on_change(checked);
  }, []);

  const id = React.useMemo(() => generateId(), []);
  return (
    <Box flex='1'>
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
