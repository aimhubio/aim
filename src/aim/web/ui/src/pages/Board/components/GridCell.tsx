import * as React from 'react';
import * as _ from 'lodash-es';

import { dataVizElementsMap } from './dataVizElementsMap';
import GroupedBox from './GroupedBox';

function GridCell(props: any) {
  const Component = dataVizElementsMap[props.viz.type as 'LineChart'];

  const stackMap = React.useMemo(() => {
    const stackValues: any = {};
    const data = props.viz.data;

    for (let i = 0; i < data?.length; i++) {
      stackValues[data[i].stack] = data[i].stack_val;
    }
    return stackValues;
  }, [props.viz.data]);

  const [stackValue, setStackValue] = React.useState<number>();

  const sliderValues = Object.keys(stackMap)
    .map((key) => (key === 'undefined' ? 0 : +key))
    .sort((a, b) => a - b);

  React.useEffect(() => {
    setStackValue(sliderValues[0]);
  }, [stackMap]);

  return props.viz.no_facet !== false ? (
    <>
      {Array.isArray(props.viz.data) ? (
        Object.values(_.groupBy(props.viz.data, 'type')).map((vals, i) => {
          const Component =
            dataVizElementsMap[
              typeof props.viz.type === 'function'
                ? props.viz.type(vals[0].type)
                : props.viz.type
            ];
          const compProps = {
            ...props.viz,
            data: vals,
          };
          return <Component key={`${i}-${vals[0].type}`} {...compProps} />;
        })
      ) : (
        <Component {...props.viz} />
      )}
    </>
  ) : (
    <GroupedBox
      viz={props.viz}
      stack={{ stackMap, stackValue, update: setStackValue }}
    />
  );
}

export default React.memo(GridCell);
