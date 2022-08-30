// visualizationType: 'box', // 'box', 'sequence'
import * as React from 'react';

import { IQueryFormProps, IUIConfig } from 'modules/BaseExplorer/types';
import {
  Grouping,
  QueryForm,
  Visualizer,
} from 'modules/BaseExplorer/components';
import Controls from 'modules/BaseExplorer/components/Controls';

import { AlignmentOptionsEnum } from 'utils/d3';
import { filterMetricsData } from 'utils/filterMetricData';

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
    visualizations: [Visualizer],
    grouping: Grouping,
    box: function CustomeMetricVisualizer(props: any) {
      let data = props.data.data;
      let element = React.useRef<HTMLIFrameElement>(null);

      const { values, steps } = filterMetricsData(
        data,
        AlignmentOptionsEnum.STEP,
      );

      React.useEffect(() => {
        if (element.current) {
          let doc = element.current.contentWindow!.document;
          doc.open();
          doc.write(
            `
            <html>
            <head>
              <link rel="stylesheet" href="https://pyscript.net/alpha/pyscript.css" />
              <script defer src="https://pyscript.net/alpha/pyscript.js"></script>
              <py-env>
                - numpy
                - matplotlib
              </py-env>
            </head>
            <body>
              <div id="plot"></div>
              <py-script output="plot">
                import matplotlib.pyplot as plt
                import numpy as np
          
                x = np.random.randn(1000)
                y = np.random.randn(1000)
          
                fig = plt.figure()
                ax = fig.add_subplot(1, 1, 1)
                ax.plot([${steps}], [${values}], color='tab:blue')
                fig
              </py-script>
            </body>
            </html>
            `,
          );
          doc.close();
        }
      }, []);

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
    controls: Controls,
  },
};

export default ui;
