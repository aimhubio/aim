import * as React from 'react';

import { Box, Switch, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function SwitchVizElement(props: any) {
  const [checked, setChecked] = React.useState(props.options.value);

  React.useEffect(() => {
    if (props.options.value !== checked) {
      setChecked(props.options.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options.value]);

  const onChange = React.useCallback((checked: boolean) => {
    setChecked(checked);
    props.callbacks?.on_change(checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const id = React.useMemo(generateId, []);
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
      <Switch {...props.options} checked={checked} onCheckedChange={onChange} />
    </Box>
  );
}

export default SwitchVizElement;
