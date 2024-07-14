import * as React from 'react';
import * as _ from 'lodash-es';

import DictVisualizer from 'components/kit/DictVisualizer';
import LineChart from 'components/LineChart/LineChart';
import { Slider, Input, Text, Select, Button, Switch } from 'components/kit_v2';

import RunLogRecords from 'pages/RunDetail/RunLogRecords';
import RunDetailNotesTab from 'pages/RunDetail/RunDetailNotesTab/RunDetailNotesTab';

import { ILineChartRef } from 'types/components/LineChart/LineChart';

import DataTable from './DataTable';
import ImagesList from './ImagesList';
import AudiosList from './AudiosList';
import TextList from './TextList';
import FiguresList from './FiguresList';
import Plotly from './Plotly';

export const dataVizElementsMap: any = {
  LineChart: (props: any) => {
    const onActivePointChange = React.useCallback(
      _.debounce(props.callbacks?.on_active_point_change, 100),
      [],
    );
    const chartRef = React.useRef<ILineChartRef>(null);
    const focusedStateRef = React.useRef<any>(null);
    const activePointKeyRef = React.useRef<any>(null);

    const syncHoverState = React.useCallback(
      ({ activePoint, focusedState }) => {
        if (activePoint) {
          if (focusedState?.active) {
            /** on focus point */

            if (focusedStateRef.current?.key !== focusedState?.key) {
              focusedStateRef.current = focusedState;
              activePointKeyRef.current = null;
              onActivePointChange(activePoint, true);
            }
          } else {
            /** on mouse over */

            focusedStateRef.current = null;
            if (activePointKeyRef.current !== activePoint.key) {
              activePointKeyRef.current = activePoint.key;
              onActivePointChange(activePoint, false);
            }
          }
        } else {
          /** on mouse leave */

          focusedStateRef.current = null;
          onActivePointChange(activePoint, false);
        }
      },
      [],
    );

    return (
      <div className='VizComponentContainer'>
        <LineChart
          ref={chartRef}
          id={'0'}
          nameKey={'board'}
          data={props.data}
          syncHoverState={syncHoverState}
        />
      </div>
    );
  },
  DataFrame: (props: any) => (
    <DataTable
      data={
        typeof props.data === 'string' ? JSON.parse(props.data) : props.data
      }
    />
  ),
  Figures: (props: any) => <FiguresList key={Date.now()} data={props.data} />,
  Images: (props: any) => <ImagesList key={Date.now()} data={props.data} />,
  Audios: (props: any) => <AudiosList key={Date.now()} data={props.data} />,
  Texts: (props: any) => <TextList key={Date.now()} data={props.data} />,
  JSON: (props: any) => (
    <div className='VizComponentContainer'>
      <DictVisualizer src={props.data} />
    </div>
  ),
  HTML: (props: any) => (
    <div
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
      dangerouslySetInnerHTML={{ __html: props.data }}
    />
  ),
  Text: (props: any) => <Text>{props.data}</Text>,
  Select: (props: any) => {
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
  },
  RunMessages: (props: any) => (
    <div style={{ flex: 1 }}>
      <RunLogRecords key={props.data} runHash={props.data} inProgress={false} />
    </div>
  ),
  RunNotes: (props: any) => (
    <div style={{ flex: 1 }}>
      <RunDetailNotesTab key={props.data} runHash={props.data} />
    </div>
  ),
  Plotly: (props: any) => (
    <div className='VizComponentContainer'>
      <Plotly {...props} />
    </div>
  ),
  Slider: (props: any) => {
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
  },
  TextInput: (props: any) => {
    const onChange = React.useCallback(({ target }) => {
      props.callbacks?.on_change(target.value);
    }, []);
    return <Input value={props.options.value} onChange={onChange} />;
  },
  Button: (props: any) => {
    const onClick = React.useCallback((e) => {
      props.callbacks?.on_click(e);
    }, []);
    return (
      <Button {...props.options} onClick={onClick}>
        {props.options.label}
      </Button>
    );
  },
  Switch: (props: any) => {
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
  },
};
