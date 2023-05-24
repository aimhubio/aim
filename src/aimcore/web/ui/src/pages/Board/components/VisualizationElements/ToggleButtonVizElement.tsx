import * as React from 'react';

import { ToggleButton } from 'components/kit_v2';

function ToggleButtonVizElement(props: any) {
  const [value, setValue] = React.useState(
    props.value || props.options.defaultValue,
  );

  React.useEffect(() => {
    if (props.value !== value) {
      setValue(props.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);

  const onChange = React.useCallback((checked) => {
    setValue(checked);
    props.callbacks?.on_change(checked);
  }, []);

  return <ToggleButton {...props.options} value={value} onChange={onChange} />;
}

export default ToggleButtonVizElement;
