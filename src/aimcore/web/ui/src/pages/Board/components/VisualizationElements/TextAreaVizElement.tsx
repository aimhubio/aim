import * as React from 'react';

import { Box, Text, Textarea } from 'components/kit_v2';

import generateId from 'utils/generateId';

function TextAreaVizElement(props: any) {
  const { label, ...restOptions } = props.options;
  const onChange = React.useCallback(({ target }) => {
    props.callbacks?.on_change(target.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const id = React.useMemo(generateId, []);
  return (
    <Box>
      {label && (
        <Text
          as='label'
          htmlFor={id}
          lineHeight={1.5}
          disabled={props.options.disabled}
        >
          {label}
        </Text>
      )}
      <Textarea {...restOptions} onChange={onChange} />
    </Box>
  );
}

export default TextAreaVizElement;
