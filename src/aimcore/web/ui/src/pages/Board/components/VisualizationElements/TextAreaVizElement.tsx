import * as React from 'react';

import { Box, Text, Textarea } from 'components/kit_v2';

import generateId from 'utils/generateId';

function TextAreaVizElement(props: any) {
  const { label, ...restOption } = props.options;
  const onChange = React.useCallback(({ target }) => {
    props.callbacks?.on_change(target.value);
  }, []);

  const id = generateId();
  return (
    <Box flex='1'>
      {label && (
        <Text as='label' htmlFor={id} disabled={props.options.disabled}>
          {label}
        </Text>
      )}
      <Textarea {...restOption} onChange={onChange} />
    </Box>
  );
}

export default TextAreaVizElement;
