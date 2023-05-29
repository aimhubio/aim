import * as React from 'react';

import { Input, Text } from 'components/kit_v2';

function TextInputVizElement(props: any) {
  const onChange = React.useCallback(({ target }) => {
    props.callbacks?.on_change(target.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const id = React.useMemo(() => `text_input_${Date.now()}`, []);
  return (
    <div style={{ flex: 1 }}>
      {props.options.label && (
        <Text as='label' htmlFor={id} disabled={props.options.disabled}>
          {props.options.label}
        </Text>
      )}
      <Input
        id={id}
        value={props.options.value}
        disabled={props.options.disabled}
        onChange={onChange}
      />
    </div>
  );
}

export default TextInputVizElement;
