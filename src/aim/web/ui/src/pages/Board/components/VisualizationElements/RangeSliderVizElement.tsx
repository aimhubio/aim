import * as React from 'react';
import * as _ from 'lodash-es';

import { Slider, Text } from 'components/kit_v2';

function RangeSliderVizElement(props: any) {
  const onChange = React.useCallback(
    _.debounce(props.callbacks?.on_change, 100),
    [],
  );
  const id = React.useMemo(() => `range_slider_${Date.now()}`, []);
  return (
    <div>
      {props.options.label && (
        <Text as='label' htmlFor={id} disabled={props.options.disabled}>
          {props.options.label}
        </Text>
      )}
      <Slider
        id={id}
        min={props.options.min}
        max={props.options.max}
        value={props.options.value}
        step={props.options.step}
        onValueChange={onChange}
      />
    </div>
  );
}

export default RangeSliderVizElement;
