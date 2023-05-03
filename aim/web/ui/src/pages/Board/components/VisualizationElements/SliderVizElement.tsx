import * as React from 'react';
import * as _ from 'lodash-es';

import { Slider } from 'components/kit_v2';

function SliderVizElement(props: any) {
  const onChange = React.useCallback(
    _.debounce(props.callbacks?.on_change, 100),
    [],
  );
  return (
    <Slider
      min={props.options.min}
      max={props.options.max}
      value={[props.options.value]}
      step={0.01}
      onValueChange={onChange}
    />
  );
}

export default SliderVizElement;
