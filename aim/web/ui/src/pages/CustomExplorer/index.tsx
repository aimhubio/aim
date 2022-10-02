import * as React from 'react';

import Editor from '@monaco-editor/react';
import renderer, { getDefaultHydration } from 'modules/BaseExplorer';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import { Button } from 'components/kit';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import {
  AlignmentOptionsEnum,
  ChartTypeEnum,
  CurveEnum,
  ScaleEnum,
} from 'utils/d3';
import { filterMetricsData } from 'utils/filterMetricData';

const defaultConfig = getDefaultHydration();

const FiguresExplorer = renderer(
  {
    sequenceName: SequenceTypesEnum.Metric,
    name: 'Sandbox',
    adapter: {
      objectDepth: AimObjectDepths.Sequence,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: function CustomVisualizer(props: any) {
          const {
            engine: { useStore, pipeline },
          } = props;
          console.log(useStore(pipeline.dataSelector));
          const data = useStore(pipeline.dataSelector)?.map((item: any) => {
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

plots = [[]]

metrics_list = []

# smoothing section
def calc_ema(values, factor):
  if len(values) < 2:
    return values
  smoothed = [values[0]]
  for i, _ in enumerate(values[1:], start=1):
    smoothed.append(smoothed[i - 1] * factor + values[i] * (1 - factor))
  return smoothed

# map metrics to lines (charts)
for i, metric in enumerate(metrics):
  # set chart facet
  if metric.name in metrics_list:
    chart_index = metrics_list.index(metric.name)
  else:
    chart_index = len(metrics_list)
    metrics_list.append(metric.name)
  if chart_index >= len(plots):
    plots.append([])
  plots[chart_index].append({
    "key": f'{metric.name}',
    "data": {
      "xValues": metric.steps,
      # apply smoothing only on bleu metrics
      "yValues": calc_ema(list(metric.values), 0.6) if metric.name == "bleu" else metric.values
    },
    # set line color
    "color": f'rgb({(i * 3 + 50) % 200}, {(i * 5 + 100) % 200}, {(i * 7 + 150) % 200})',
    # set line stroke style 
    "dasharray": "0" if metric.context.subset == "val" else "5 5"
  })

def on_active_point_change(val, is_active):
  print(val.key, val.xValue, val.yValue)

data = {
  "plots": {
    "data": plots,
    "callbacks": {
      "on_active_point_change": on_active_point_change
    }
  }
}`);
          const [result, setResult] = React.useState<Record<string, any>>({});

          React.useEffect(() => {
            async function main() {
              pyodide.current = await (window as any).loadPyodide({
                stdout: (...args: any[]) => {
                  document.getElementById(
                    'console',
                  )!.innerHTML! += `<pre style='font-size: 12px'>${args.join(
                    ', ',
                  )}</pre>`;
                },
              });
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
                  width: '40%',
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
                  width: '60%',
                  height: '100%',
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {result.plots && (
                  <div style={{ flex: 0.7 }}>
                    <ChartPanel
                      selectOptions={[]}
                      chartType={ChartTypeEnum.LineChart}
                      data={result.plots.data}
                      focusedState={{
                        key: null,
                        active: false,
                      }}
                      tooltip={{}}
                      zoom={{}}
                      onActivePointChange={
                        result.plots.callbacks?.on_active_point_change ?? null
                      }
                      chartProps={result.plots.data.map(() => ({
                        axesScaleType: {
                          xAxis: ScaleEnum.Linear,
                          yAxis: ScaleEnum.Linear,
                        },
                        ignoreOutliers: false,
                        highlightMode: HighlightEnum.Off,
                        curveInterpolation: CurveEnum.Linear,
                      }))}
                      onRunsTagsChange={() => null}
                      controls={null}
                    />
                  </div>
                )}
                <div
                  style={{
                    flex: 0.3,
                    borderTop: '1px solid #ccc',
                    padding: '6px 8px',
                    overflow: 'auto',
                  }}
                  id='console'
                />
              </div>
            </div>
          );
        } as React.FunctionComponent,
        controls: {} as any,
        box: {
          component: () => null,
          initialState: {} as any,
        },
      },
    },
  },
  __DEV__,
);

export default FiguresExplorer;
