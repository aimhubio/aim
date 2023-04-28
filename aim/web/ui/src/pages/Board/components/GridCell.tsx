import * as React from 'react';
import * as _ from 'lodash-es';

import GroupedBox from './GroupedBox';
import VizElementsMap, { VizElementKey } from './VisualizationElements';

function GridCell(props: any) {
  const Component = VizElementsMap[props.viz.type as VizElementKey];

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
          const vizElementKey =
            typeof props.viz.type === 'function'
              ? props.viz.type(vals[0].type)
              : props.viz.type;
          const Component = VizElementsMap[vizElementKey as VizElementKey];
          const compProps = {
            ...props.viz,
            data: vals,
          };
          return (
            <React.Suspense fallback={null} key={`${i}-${vals[0].type}`}>
              <Component {...compProps} />
            </React.Suspense>
          );
        })
      ) : (
        <React.Suspense fallback={null}>
          <Component {...props.viz} />
        </React.Suspense>
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
