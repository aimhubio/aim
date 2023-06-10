import * as React from 'react';
import * as _ from 'lodash-es';

import { Box, Slider, Text } from 'components/kit_v2';

import generateId from 'utils/generateId';

function RangeSliderVizElement(props: any) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange = React.useCallback(
    _.debounce(props.callbacks?.on_change, 100),
    [],
  );
  const id = React.useMemo(generateId, []);
  return (
    <Box>
      {props.options.label && (
        <Text
          as='label'
          htmlFor={id}
          lineHeight={1.5}
          disabled={props.options.disabled}
        >
          {props.options.label}
        </Text>
      )}
      <Slider
        id={id}
        min={props.options.min}
        max={props.options.max}
        value={props.options.value}
        step={props.options.step}
        disabled={props.options.disabled}
        onValueChange={onChange}
      />
    </Box>
  );
}

export default RangeSliderVizElement;
