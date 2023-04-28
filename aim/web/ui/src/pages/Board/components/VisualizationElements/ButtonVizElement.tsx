import * as React from 'react';

import { Button } from 'components/kit_v2';

function ButtonVizElement(props: any) {
  const onClick = React.useCallback((e) => {
    props.callbacks?.on_click(e);
  }, []);
  return (
    <Button {...props.options} onClick={onClick}>
      {props.options.label}
    </Button>
  );
}
export default ButtonVizElement;
