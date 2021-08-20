import React, { memo } from 'react';
import { isEmpty, noop } from 'lodash-es';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import LineChart from 'components/LineChart/LineChart';
import contextToString from 'utils/contextToString';
import COLORS from 'config/colors/colors';

import {
  IRunBatch,
  IRunDetailMetricsAndSystemTabProps,
} from 'types/pages/runs/Runs';
import { CurveEnum, ScaleEnum } from 'utils/d3';

function RunDetailMetricsAndSystemTab({
  runHash,
  runTraces,
  runBatch,
  isSystem,
}: IRunDetailMetricsAndSystemTabProps): React.FunctionComponentElement<React.ReactNode> {
  React.useEffect(() => {
    if (!runBatch) {
      const runsBatchRequestRef = runDetailAppModel.getRunBatch(
        runTraces,
        runHash,
      );
      runsBatchRequestRef.call();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTraces, runHash]);

  return (
    <div className='RunDetailMetricsTab'>
      {runBatch && (
        <div className='RunDetailMetricsTab__container'>
          {!isEmpty(runBatch) ? (
            runBatch.map((batch: IRunBatch, i: number) => {
              return (
                <div
                  key={i}
                  className='RunDetailMetricsTab__container__chartBox'
                >
                  <LineChart
                    data={[
                      {
                        key:
                          batch.metric_name +
                          contextToString(batch.context, 'keyHash'),
                        data: {
                          xValues: [...batch.iters],
                          yValues: [...batch.values],
                        },
                        color: COLORS[0][0],
                        dasharray: '0',
                        selectors: [
                          batch.metric_name +
                            contextToString(batch.context, 'keyHash'),
                        ],
                      },
                    ]}
                    index={i}
                    syncHoverState={noop}
                    axesScaleType={{
                      xAxis: ScaleEnum.Linear,
                      yAxis: ScaleEnum.Linear,
                    }}
                    displayOutliers
                    zoomMode={false}
                    highlightMode={0}
                    curveInterpolation={CurveEnum.Linear}
                  />
                </div>
              );
            })
          ) : (
            <p>No tracked {isSystem ? 'system' : ''} metrics</p>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(RunDetailMetricsAndSystemTab);
