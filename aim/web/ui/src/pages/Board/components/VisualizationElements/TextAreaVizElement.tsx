import * as React from 'react';

import { Textarea } from 'components/kit_v2';

function TextAreaVizElement(props: any) {
  const onChange = React.useCallback(({ target }) => {
    props.callbacks?.on_change(target.value);
  }, []);
  return (
    <Textarea
      {...props.options}
      value={props.options.value}
      onChange={onChange}
    />
  );
}

export default TextAreaVizElement;
