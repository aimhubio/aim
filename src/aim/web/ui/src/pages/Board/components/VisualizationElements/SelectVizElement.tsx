import * as React from 'react';

import { Select } from 'components/kit_v2';

function SelectVizElement(props: any) {
  let multi = Array.isArray(props.options.values);
  return (
    <Select
      multiple={multi}
      searchable
      value={multi ? props.options.values : props.options.value}
      popoverProps={{
        align: 'start',
      }}
      options={[
        {
          group: '',
          options: props.options.options.map((opt: string) => ({
            value: opt,
            label: opt,
          })),
        },
      ]}
      onValueChange={(key: string) => props.callbacks?.on_change?.(key)}
    />
  );
}

export default SelectVizElement;
