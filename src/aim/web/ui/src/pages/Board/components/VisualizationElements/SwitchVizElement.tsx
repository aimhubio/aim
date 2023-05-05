import * as React from 'react';

import { Switch } from 'components/kit_v2';

function SwitchVizElement(props: any) {
  const [checked, setChecked] = React.useState(props.data);

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

  return (
    <Switch {...props.options} checked={checked} onCheckedChange={onChange} />
  );
}

export default SwitchVizElement;
