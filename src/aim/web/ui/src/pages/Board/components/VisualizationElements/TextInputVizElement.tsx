import * as React from 'react';

import { Input } from 'components/kit_v2';

function TextInputVizElement(props: any) {
  const onChange = React.useCallback(({ target }) => {
    props.callbacks?.on_change(target.value);
  }, []);

  return <Input value={props.options.value} onChange={onChange} />;
}

export default TextInputVizElement;
