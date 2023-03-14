import * as React from 'react';
import * as _ from 'lodash-es';

import { dataVizElementsMap } from './dataVizElementsMap';
import GroupedBox from './GroupedBox';

function GridCell(props: any) {
  const Component = dataVizElementsMap[props.viz.type as 'LineChart'];

  const stackMap = React.useMemo(() => {
    const stackValues: any = {};
    const data = props.viz.data;

    for (let i = 0; i < data.length; i++) {
      stackValues[data[i].stack] = data[i].stack_val;
    }
    return stackValues;
  }, [props.viz.data]);

  const [stackValue, setStackValue] = React.useState<number>();

  const sliderValues = Object.keys(stackMap)
    .map((key) => +key)
    .sort((a, b) => a - b);

  React.useEffect(() => {
    setStackValue(sliderValues[0]);
  }, [stackMap]);

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        backgroundColor: '#d2d4dc',
        boxShadow: '0 0 0 1px #b5b9c5',
        maxWidth: props.maxWidth,
        background: '#fff',
        backgroundImage: 'radial-gradient(#b5b9c5 1px, transparent 0)',
        backgroundSize: '10px 10px',
        overflow: 'hidden',
      }}
    >
      {props.viz.no_facet !== false ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#fff',
            overflow: 'auto',
          }}
        >
          {Array.isArray(props.viz.data) ? (
            Object.values(_.groupBy(props.viz.data, 'type')).map((vals, i) => {
              const Component =
                dataVizElementsMap[
                  (typeof props.viz.type === 'function'
                    ? props.viz.type(vals[0].type)
                    : props.viz.type) as 'LineChart'
                ];
              const compProps = {
                ...props.viz,
                data: vals,
              };
              return (
                <div
                  key={`${i}-${vals[0].type}`}
                  style={{
                    minWidth: 'calc(100% - 10px)',
                    minHeight: 'calc(100% - 10px)',
                    height: 'calc(100% - 10px)',
                    padding: '5px',
                    margin: '5px',
                    border: '1px solid #d2d4dc',
                  }}
                >
                  <Component {...compProps} />
                </div>
              );
            })
          ) : (
            <div
              style={{
                minWidth: 'calc(100% - 10px)',
                minHeight: 'calc(100% - 10px)',
                height: 'calc(100% - 10px)',
                padding: '5px',
                margin: '5px',
                border: '1px solid #d2d4dc',
              }}
            >
              <Component {...props.viz} />
            </div>
          )}
        </div>
      ) : (
        <GroupedBox
          viz={props.viz}
          stack={{ stackMap, stackValue, update: setStackValue }}
        />
      )}
    </div>
  );
}

export default React.memo(GridCell);
