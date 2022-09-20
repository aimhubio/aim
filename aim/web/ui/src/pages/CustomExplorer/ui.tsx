// visualizationType: 'box', // 'box', 'sequence'
import * as React from 'react';

import { IQueryFormProps, IUIConfig } from 'modules/BaseExplorer/types';
import { Grouping, QueryForm } from 'modules/BaseExplorer/components';
import Controls from 'modules/BaseExplorer/components/Controls';

import { filterMetricsData } from 'utils/filterMetricData';
import { AlignmentOptionsEnum } from 'utils/d3';

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
        let element = React.useRef<HTMLIFrameElement>(null);
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

        React.useEffect(() => {
          if (element.current && data && data.length > 0) {
            const metrics = JSON.stringify(data);
            let doc = element.current.contentWindow!.document;
            doc.open();
            doc.write(
              `
              <html>
              <head>
                <link rel="stylesheet" href="https://pyscript.net/alpha/pyscript.css" />
                <script defer src="https://pyscript.net/alpha/pyscript.js"></script>
                <style>
                  body {
                    background-color: #eee;
                    height: 100%;
                  }
                  .container {
                    height: 100%;
                    display: flex;
                  }
                  .box {
                    background-color: #fff;
                    border: 1px solid #ccc;
                    padding: 10px;
                    margin: 10px 5px;
                    overflow: auto;
                  }
                  .repl {
                    flex: 1;
                  }
                  .result {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                  }
                  .output {
                    flex: 0.65;
                  }
                  .errors {
                    flex: 0.35;
                    max-height: 300px;
                  }
                  #output, #errors {
                    height: 70%;
                  }
                </style>
                <py-env>
                  - numpy
                  - matplotlib
                </py-env>
              </head>
              <body>
                <py-script>
                  import js
                  import json
                  metrics = json.loads('${metrics}')
                </py-script>
                <div class="container">
                  <div class="repl box">
                    <py-repl std-out="output" std-err="errors">
                      import matplotlib.pyplot as plt
                      
fig = plt.figure()
ax = fig.add_subplot(1, 1, 1)
for i, metric in enumerate(metrics):
  color = (i / 10 % 1, i / 30 % 1, i / 50 % 1)
  ax.plot(metric["steps"], metric["values"], color=color)
fig
                    </py-repl>
                  </div>
                  <div class="result">
                    <div class="output box">
                      <b>Output</b><hr>
                      <div id="output"></div>
                    </div>
                    <div class="errors box">
                      <b>Errors and Warnings</b><hr>
                      <div id="errors"></div>
                    </div>
                  </div>
                </div>
              </body>
              </html>
              `,
            );
            doc.close();
          }
        }, [data]);

        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            <iframe
              ref={element}
              src='about:blank'
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
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
