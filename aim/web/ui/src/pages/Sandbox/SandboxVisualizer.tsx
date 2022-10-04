import * as React from 'react';
import classnames from 'classnames';

import Editor from '@monaco-editor/react';

import ChartPanel from 'components/ChartPanel/ChartPanel';
import { Button, Spinner } from 'components/kit';

import {
  AlignmentOptionsEnum,
  ChartTypeEnum,
  CurveEnum,
  ScaleEnum,
  HighlightEnum,
} from 'utils/d3';
import { filterMetricsData } from 'utils/filterMetricData';

import { initialCode } from './sandboxCode';
import DataGrid from './DataGrid';

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

  const editorValue = React.useRef(initialCode);
  const [result, setResult] = React.useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    async function main() {
      pyodide.current = await (window as any).loadPyodide({
        stdout: (...args: any[]) => {
          window.requestAnimationFrame(() => {
            const terminal = document.getElementById('console');
            if (terminal) {
              terminal.innerHTML! += `<p>>>> ${args.join(', ')}</p>`;
              terminal.scrollTop = terminal.scrollHeight;
            }
          });
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
      setIsProcessing(true);
      const code = editorValue.current.replace('aim-ui-client', 'js');
      await pyodide.current!.loadPackagesFromImports(code);
      pyodide.current!.runPythonAsync(code).then(() => {
        const resultData = pyodide.current.globals.get('data').toJs();
        const convertedResult = toObject(resultData);
        setResult(convertedResult);
        setIsProcessing(false);
      });
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
            value={editorValue.current}
            onChange={(v) => (editorValue.current = v!)}
            loading={<span />}
          />
        </div>
        <div
          className={classnames('SandboxVisualizer__main__components', {
            'SandboxVisualizer__main__components--loading':
              isProcessing === null,
            'SandboxVisualizer__main__components--processing': isProcessing,
          })}
        >
          {isProcessing !== false && (
            <div className='SandboxVisualizer__main__components__spinner'>
              <Spinner />
            </div>
          )}
          <div className='SandboxVisualizer__main__components__viz'>
            {result.lines && (
              <div style={{ flex: 0.5 }}>
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
            {result.dataframe && (
              <div style={{ flex: 0.5, height: '50%' }}>
                <DataGrid
                  data={
                    typeof result.dataframe.data === 'string'
                      ? JSON.parse(result.dataframe.data)
                      : result.dataframe.data
                  }
                />
              </div>
            )}
          </div>
          <pre
            id='console'
            className='SandboxVisualizer__main__components__console'
          />
        </div>
      </div>
    </div>
  );
}
