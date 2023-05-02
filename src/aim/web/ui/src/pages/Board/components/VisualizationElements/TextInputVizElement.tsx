import * as React from 'react';

import { Input } from 'components/kit_v2';

function TextInputVizElement(props: any) {
  const onChange = React.useCallback(({ target }) => {
    props.callbacks?.on_change(target.value);
  }, []);

  return (
    <div style={{ flex: 1 }}>
      <Input value={props.options.value} onChange={onChange} />
    </div>
  );
}

export default TextInputVizElement;
