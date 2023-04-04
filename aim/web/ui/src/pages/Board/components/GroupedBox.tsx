import * as React from 'react';
import * as _ from 'lodash-es';
import { useResizeObserver } from 'hooks';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Slider, Text } from 'components/kit';

import { formatValue } from 'utils/formatValue';

import { dataVizElementsMap } from './dataVizElementsMap';

function GroupedBox(props: any) {
  const boxSize = {
    width: props.viz.size?.width ?? 300,
    height: props.viz.size?.height ?? 200,
  };
  const data = React.useMemo(() => {
    return props.viz.data.map((item: any) => ({
      ...item,
      style: {
        left: 200 + (item.column ?? 0) * boxSize.width,
        top: 30 + (item.row ?? 0) * boxSize.height,
        width: boxSize.width,
        height: boxSize.height,
      },
    }));
  }, [props.viz.data]);

  let container: React.MutableRefObject<HTMLDivElement> =
    React.useRef<HTMLDivElement>(document.createElement('div'));
  let grid: React.MutableRefObject<HTMLDivElement> =
    React.useRef<HTMLDivElement>(document.createElement('div'));
  const rafIDRef = React.useRef<number>();

  let [gridWindow, setGridWindow] = React.useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const onScroll = React.useCallback(({ target }: any) => {
    setGridWindow({
      left: target.scrollLeft,
      top: target.scrollTop,
      width: container.current.offsetWidth,
      height: container.current.offsetHeight,
    });
  }, []);

  React.useEffect(() => {
    setGridWindow({
      left: grid.current.scrollLeft,
      top: grid.current.scrollTop,
      width: container.current.offsetWidth,
      height: container.current.offsetHeight,
    });
  }, []);

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        rafIDRef.current = window.requestAnimationFrame(() => {
          setGridWindow((gW) => ({
            left: gW.left,
            top: gW.top,
            width: container.current.offsetWidth,
            height: container.current.offsetHeight,
          }));
        });
      }
    },
    [setGridWindow],
  );

  const observerReturnCallback = React.useCallback(() => {
    if (rafIDRef.current) {
      window.cancelAnimationFrame(rafIDRef.current);
    }
  }, []);

  useResizeObserver(resizeObserverCallback, container, observerReturnCallback);

  const filteredItems = data.filter(
    (item: any) =>
      item.style.left >= gridWindow.left - item.style.width &&
      item.style.left <= gridWindow.left + gridWindow.width &&
      item.style.top >= gridWindow.top - item.style.height &&
      item.style.top <= gridWindow.top + gridWindow.height,
  );

  let axesData = React.useMemo(() => {
    let axes: any = {
      rows: {},
      columns: {},
    };

    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      axes.rows[item.row] = {
        order: item.row ?? 0,
        value: formatValue(item.row_val) ?? null,
        options: item.row_options ?? null,
        style: {
          position: 'absolute',
          top: item.style.top,
          left: -1,
          height: item.style.height - 30,
          width: 200,
          padding: '0.5rem',
          backgroundColor: '#fff',
          boxShadow: 'inset 0 -1px 0 0 #b5b9c5',
          overflow: 'hidden',
          textAlign: 'right',
          textOverflow: 'ellipsis',
          lineHeight: '0.875rem',
          zIndex: item.row ?? 0,
        },
      };
      axes.columns[item.column] = {
        order: item.column ?? 0,
        value: formatValue(item.column_val) ?? null,
        options: item.column_options ?? null,
        style: {
          position: 'absolute',
          top: -1,
          left: item.style.left,
          height: 30,
          width: item.style.width,
          padding: '0.25rem 0.5rem',
          backgroundColor: '#fff',
          boxShadow: '-1px 0 0 0 #b5b9c5',
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          zIndex: item.column ?? 0,
        },
      };
    }

    return {
      rows: Object.values(axes.rows).sort(
        (a: any, b: any) => a.order - b.order,
      ),
      columns: Object.values(axes.columns).sort(
        (a: any, b: any) => a.order - b.order,
      ),
    };
  }, [data]);

  // Filter column group values based on their position intersection with the viewport
  let columnsAxisItems = axesData.columns.filter(
    (item: any) =>
      item.style.left >= gridWindow.left - item.style.width &&
      item.style.left <= gridWindow.left + gridWindow.width,
  );

  // Filter row group values based on their position intersection with the viewport
  let rowsAxisItems = axesData.rows.filter(
    (item: any) =>
      item.style.top >= gridWindow.top - item.style.height &&
      item.style.top <= gridWindow.top + gridWindow.height,
  );

  const groupedByPosition = _.groupBy(filteredItems, (item) => {
    const rowId = item.row ?? 0;
    const columnId = item.column ?? 0;
    return `${rowId}--${columnId}`;
  });

  const gridSize = React.useMemo(() => {
    let rightEdge = 0;
    let bottomEdge = 0;

    let itemWidth = 0;
    let itemHeight = 0;

    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.style.left > rightEdge) {
        rightEdge = item.style.left;
        itemWidth = item.style.width;
      }

      if (item.style.top > bottomEdge) {
        bottomEdge = item.style.top;
        itemHeight = item.style.height;
      }
    }

    const horizontalRulerHeight = 30;

    return {
      width: rightEdge + itemWidth,
      height: bottomEdge + itemHeight - horizontalRulerHeight,
    };
  }, [data]);

  const sliderValues = Object.keys(props.stack.stackMap)
    .map((key) => +key)
    .sort((a, b) => a - b);

  return (
    <div className='BoxVirtualizer'>
      {rowsAxisItems && rowsAxisItems.length > 0 && (
        <div className='BoxVirtualizer__placeholder' />
      )}
      <div
        ref={container}
        className='BoxVirtualizer__container'
        onScroll={onScroll}
      >
        {((columnsAxisItems && columnsAxisItems.length > 0) ||
          (rowsAxisItems && rowsAxisItems.length > 0)) && (
          <div
            className='BoxVirtualizer__container__horizontalRuler'
            style={{
              width: gridSize.width,
            }}
          >
            {columnsAxisItems?.map((item: any, i) => (
              <Tooltip key={i} title={item.value}>
                <div style={item.style}>
                  <Text>{item.value}</Text>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
        {rowsAxisItems && rowsAxisItems.length > 0 && (
          <div
            className='BoxVirtualizer__container__verticalRuler'
            style={{
              height: gridSize.height,
            }}
          >
            {rowsAxisItems?.map((item: any, i) => (
              <div key={i} style={item.style}>
                <Tooltip title={item.value}>
                  <span>
                    <Text>{item.value}</Text>
                  </span>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
        <div
          ref={grid}
          className='BoxVirtualizer__grid'
          style={{
            width: gridSize.width,
            height: gridSize.height,
          }}
        >
          {Object.entries(groupedByPosition).map(([groupId, items]) => (
            <div
              key={groupId}
              style={{
                ...items[0].style,
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                boxShadow:
                  '-1px -1px 0 0px #b5b9c5, inset -1px -1px 0 0px #b5b9c5',
                overflow: 'auto',
              }}
            >
              {Object.values(_.groupBy(items, 'type')).map((vals, i) => {
                const Component =
                  dataVizElementsMap[
                    (typeof props.viz.type === 'function'
                      ? props.viz.type(vals[0].type)
                      : props.viz.type) as 'LineChart'
                  ];

                const compProps = {
                  ...props.viz,
                  data: vals.filter(
                    (v) => (v.stack ?? 0) === props.stack.stackValue,
                  ),
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
                      flex: 1,
                    }}
                  >
                    {sliderValues.length > 1 && (
                      <div
                        className='DepthSlider'
                        style={{
                          display: 'block',
                          paddingTop: 0,
                        }}
                      >
                        <Tooltip
                          title={formatValue(
                            props.stack.stackMap[props.stack.stackValue],
                          )}
                        >
                          <div
                            style={{
                              display: 'inline-block',
                              height: 12,
                              whiteSpace: 'nowrap',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: 'center',
                              lineHeight: '10px',
                            }}
                          >
                            <Text size={10}>
                              {formatValue(
                                props.stack.stackMap[props.stack.stackValue],
                              )}
                            </Text>
                          </div>
                        </Tooltip>
                        <Slider
                          label=''
                          aria-labelledby='track-false-slider'
                          track={false}
                          valueLabelDisplay='off'
                          getAriaValueText={(value) =>
                            `${props.stack.stackMap[value]}`
                          }
                          value={props.stack.stackValue}
                          onChange={(e, value) => props.stack.update(value)}
                          step={null}
                          marks={
                            sliderValues.map((v) => ({
                              value: v,
                            })) as any
                          }
                          min={sliderValues[0]}
                          max={sliderValues[sliderValues.length - 1]}
                          style={{ width: '100%' }}
                          prevIconNode={
                            <Button
                              onClick={() =>
                                props.stack.stackValue !== sliderValues[0] &&
                                props.stack.update(
                                  sliderValues[
                                    sliderValues.indexOf(
                                      props.stack.stackValue,
                                    ) - 1
                                  ],
                                )
                              }
                              className='prevIconBtn'
                              disabled={
                                props.stack.stackValue === sliderValues[0]
                              }
                              size='small'
                              withOnlyIcon
                            >
                              <Icon name='arrow-left' fontSize={10} />
                            </Button>
                          }
                          nextIconNode={
                            <Button
                              onClick={() =>
                                props.stack.stackValue !==
                                  sliderValues[sliderValues.length - 1] &&
                                props.stack.update(
                                  sliderValues[
                                    sliderValues.indexOf(
                                      props.stack.stackValue,
                                    ) + 1
                                  ],
                                )
                              }
                              className='nextIconBtn'
                              disabled={
                                props.stack.stackValue ===
                                sliderValues[sliderValues.length - 1]
                              }
                              size='small'
                              withOnlyIcon
                            >
                              <Icon name='arrow-right' fontSize={10} />
                            </Button>
                          }
                        />
                      </div>
                    )}
                    <div
                      style={{
                        width: '100%',
                        height: `calc(100% - ${
                          sliderValues.length > 1 ? 48 : 0
                        }px)`,
                      }}
                    >
                      <Component {...compProps} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(GroupedBox);
