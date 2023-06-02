import * as React from 'react';

import { Box, Input, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function TextInputVizElement(props: any) {
  const onChange = React.useCallback(({ target }) => {
    props.callbacks?.on_change(target.value);
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
      <Input
        id={id}
        value={props.options.value}
        disabled={props.options.disabled}
        onChange={onChange}
      />
    </Box>
  );
}

export default TextInputVizElement;
