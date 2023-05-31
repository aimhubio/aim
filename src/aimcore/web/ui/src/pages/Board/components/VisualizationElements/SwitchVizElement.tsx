import * as React from 'react';

import { Box, Switch, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function SwitchVizElement(props: any) {
  const [checked, setChecked] = React.useState(props.value || props.data);

  React.useEffect(() => {
    if (props.data !== checked) {
      setChecked(props.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);

  const onChange = React.useCallback((checked) => {
    setChecked(checked);
    props.callbacks?.on_change(checked);
  }, []);

  const id = React.useMemo(() => generateId(), []);
  return (
    <Box display='flex' ai='center'>
      {props.options.label && (
        <Text
          lineHeight={1}
          as='label'
          css={{ mr: '$5' }}
          htmlFor={id}
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
