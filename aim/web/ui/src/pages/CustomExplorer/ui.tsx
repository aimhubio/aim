// visualizationType: 'box', // 'box', 'sequence'
import * as React from 'react';

import Editor from '@monaco-editor/react';
import { IQueryFormProps, IUIConfig } from 'modules/BaseExplorer/types';
import { Grouping, QueryForm } from 'modules/BaseExplorer/components';
import Controls from 'modules/BaseExplorer/components/Controls';

import { Button } from 'components/kit';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { filterMetricsData } from 'utils/filterMetricData';
import {
  AlignmentOptionsEnum,
  ChartTypeEnum,
  CurveEnum,
  ScaleEnum,
} from 'utils/d3';

const ui: IUIConfig = {
  defaultBoxConfig: {
    width: 400,
    height: 400,
    gap: 0,
  },
  components: {
    queryForm: React.memo((props: IQueryFormProps) => (
      <QueryForm engine={props.engine} hasAdvancedMode />
    )),
    visualizations: [
      function CustomVisualizer(props: any) {
        const {
          engine: { useStore, dataSelector },
        } = props;
        const data = useStore(dataSelector)?.map((item: any) => {
          const { values, steps, epochs, timestamps } = filterMetricsData(
            item.data,
            AlignmentOptionsEnum.STEP,
          );
          return {
            name: item.data.name,
            context: item.data.context,
            values: [...values],
            steps: [...steps],
            epochs: [...epochs],
            timestamps: [...timestamps],
            run: item.run,
          };
        });

        (window as any).metrics = data;
        const pyodide = React.useRef<any>();

        const [editorValue, setEditorValue] =
          React.useState(`from aim-ui-client import metrics

data = [[]]

metrics_list = []

# smoothing section
def calc_ema(values, factor):
  if len(values) < 2:
    return values
  smoothed = [values[0]]
  for i, _ in enumerate(values[1:], start=1):
    smoothed.append(smoothed[i - 1] * factor + values[i] * (1 - factor))
  return smoothed

# map metrics to lines
for i, metric in enumerate(metrics):
  # set line facet
  if metric.name in metrics_list:
    chart_index = metrics_list.index(metric.name)
  else:
    chart_index = len(metrics_list)
    metrics_list.append(metric.name)
  if chart_index >= len(data):
    data.append([])
  data[chart_index].append({
    "key": i,
    "data": {
      "xValues": metric.steps,
      "yValues": calc_ema(list(metric.values), 0.6) # apply smoothing
    },
    # set line color
    "color": f'rgb({(i * 3 + 50) % 200}, {(i * 5 + 100) % 200}, {(i * 7 + 150) % 200})',
    # set line stroke style 
    "dasharray": "0" if metric.context.subset == "val" else "5 5"
  })
        `);
        const [result, setResult] = React.useState<any[]>([]);

        React.useEffect(() => {
          async function main() {
            pyodide.current = await (window as any).loadPyodide();
            await pyodide.current.loadPackage('numpy');
          }
          main();
        }, []);

        const execute = React.useCallback(() => {
          function toObject(x: any): any {
            if (x instanceof Map) {
              return Object.fromEntries(
                Array.from(x.entries(), ([k, v]) => [k, toObject(v)]),
              );
            } else if (x instanceof Array) {
              return x.map(toObject);
            } else {
              return x;
            }
          }
          try {
            pyodide.current!.runPython(
              editorValue.replace('aim-ui-client', 'js'),
            );
            const resultData = pyodide.current.globals.get('data').toJs();
            console.log(resultData);
            const convertedResult = toObject(resultData);
            console.log(convertedResult);
            setResult(convertedResult);
          } catch (ex) {
            console.log(ex);
          }
        }, [editorValue]);

        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: '50%',
                height: '100%',
                position: 'relative',
                borderRight: '1px solid #ccc',
                flex: 1,
              }}
            >
              <Editor
                language='python'
                height='100%'
                value={editorValue}
                onChange={(v) => setEditorValue(v!)}
                loading={<span />}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 'calc(50% - 35px)',
                backgroundColor: '#fff',
                zIndex: 1,
              }}
            >
              <Button color='primary' variant='contained' onClick={execute}>
                Run
              </Button>
            </div>
            <div
              style={{
                width: '50%',
                height: '100%',
                position: 'relative',
                flex: 1,
              }}
            >
              {result && (
                <ChartPanel
                  selectOptions={[]}
                  chartType={ChartTypeEnum.LineChart}
                  data={result}
                  focusedState={{
                    key: null,
                    active: false,
                  }}
                  tooltip={{}}
                  zoom={{}}
                  onActivePointChange={props.onActivePointChange}
                  chartProps={result.map(() => ({
                    axesScaleType: {
                      xAxis: ScaleEnum.Linear,
                      yAxis: ScaleEnum.Linear,
                    },
                    ignoreOutliers: false,
                    highlightMode: HighlightEnum.Off,
                    curveInterpolation: CurveEnum.Linear,
                  }))}
                  resizeMode={props.resizeMode}
                  onRunsTagsChange={props.onRunsTagsChange}
                  controls={null}
                />
              )}
            </div>
          </div>
        );
      },
    ],
    grouping: Grouping,
    box: () => null,
    controls: Controls,
  },
};

export default ui;
