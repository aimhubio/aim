import * as React from 'react';
import * as _ from 'lodash-es';

import { dataVizElementsMap } from './dataVizElementsMap';
import GroupedBox from './GroupedBox';

function GridCell(props: any) {
  const Component = dataVizElementsMap[props.viz.type as 'LineChart'];

  const syncMap = React.useMemo(() => {
    const syncValues: any = {};
    const data = props.viz.data;

    for (let i = 0; i < data.length; i++) {
      syncValues[data[i].sync] = data[i].sync_val;
    }
    return syncValues;
  }, [props.viz.data]);

  const [syncValue, setSyncValue] = React.useState<number>();

  const sliderValues = Object.keys(syncMap)
    .map((key) => +key)
    .sort((a, b) => a - b);

  React.useEffect(() => {
    setSyncValue(sliderValues[0]);
  }, [syncMap]);

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        backgroundColor: '#d2d4dc',
        boxShadow: '0 0 0 1px #b5b9c5',
        maxWidth: props.maxWidth,
        margin: '5px',
        background: '#fff',
        backgroundImage: 'radial-gradient(#b5b9c5 1px, transparent 0)',
        backgroundSize: '10px 10px',
        overflow: 'hidden',
      }}
    >
      {props.viz.no_facet ? (
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
          sync={{ syncMap, syncValue, update: setSyncValue }}
        />
      )}
    </div>
  );
}

export default React.memo(GridCell);
