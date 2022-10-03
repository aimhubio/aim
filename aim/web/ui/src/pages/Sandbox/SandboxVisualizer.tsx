import * as React from 'react';

import Editor from '@monaco-editor/react';

import ChartPanel from 'components/ChartPanel/ChartPanel';
import { Button } from 'components/kit';

import {
  AlignmentOptionsEnum,
  ChartTypeEnum,
  CurveEnum,
  ScaleEnum,
  HighlightEnum,
} from 'utils/d3';
import { filterMetricsData } from 'utils/filterMetricData';

import { initialCode } from './sandboxCode';

import './SandboxVisualizer.scss';

export default function SandboxVisualizer(props: any) {
  const {
    engine: { useStore, pipeline },
  } = props;

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

  const [editorValue, setEditorValue] = React.useState(initialCode);
  const [result, setResult] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    async function main() {
      pyodide.current = await (window as any).loadPyodide({
        stdout: (...args: any[]) => {
          const terminal = document.getElementById('console');
          if (terminal) {
            terminal.innerHTML! += `<p>>>> ${args.join(', ')}</p>`;
            terminal.scrollTop = terminal.scrollHeight;
          }
        },
      });

      execute();
    }
    main();
  }, []);

  const execute = React.useCallback(async () => {
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
      const code = editorValue.replace('aim-ui-client', 'js');
      await pyodide.current!.loadPackagesFromImports(code);
      pyodide.current!.runPython(code);
      const resultData = pyodide.current.globals.get('data').toJs();
      const convertedResult = toObject(resultData);
      setResult(convertedResult);
    } catch (ex) {
      console.log(ex);
    }
  }, [editorValue]);

  return (
    <div className='SandboxVisualizer'>
      <div className='SandboxVisualizer__panel'>
        <Button
          color='primary'
          variant='contained'
          size='small'
          onClick={execute}
        >
          Run
        </Button>
      </div>
      <div className='SandboxVisualizer__main'>
        <div className='SandboxVisualizer__main__editor'>
          <Editor
            language='python'
            height='100%'
            value={editorValue}
            onChange={(v) => setEditorValue(v!)}
            loading={<span />}
          />
        </div>
        <div className='SandboxVisualizer__main__components'>
          {result.lines && (
            <div className='SandboxVisualizer__main__components__viz'>
              <ChartPanel
                selectOptions={[]}
                chartType={ChartTypeEnum.LineChart}
                data={result.lines.data}
                focusedState={{
                  key: null,
                  active: false,
                }}
                tooltip={{}}
                zoom={{}}
                onActivePointChange={
                  result.lines.callbacks?.on_active_point_change ?? null
                }
                chartProps={result.lines.data.map(() => ({
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
          <pre
            id='console'
            className='SandboxVisualizer__main__components__console'
          />
        </div>
      </div>
    </div>
  );
}
