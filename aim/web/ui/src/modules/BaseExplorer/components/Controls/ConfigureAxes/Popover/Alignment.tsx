import React from 'react';
import _ from 'lodash-es';

import { SelectDropdown, Text } from 'components/kit';
import { ISelectDropdownOption as ISelectOption } from 'components/kit/SelectDropdown';

import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';

import { getSelectFormOptions } from 'modules/core/utils/getSelectFormOptions';
import { buildObjectHash } from 'modules/core/utils/hashing';
import {
  alignMetricsRequest,
  IAlignMetricsData,
} from 'modules/core/api/runsApi';
import { CustomPhaseExecutionArgs } from 'modules/core/pipeline';

import { isSystemMetric } from 'utils/isSystemMetric';
import { AlignmentOptionsEnum } from 'utils/d3';

import { IAlignmentProps } from './index';

const METRICS_ALIGNMENT_LIST: {
  value: string;
  label: string;
  group?: string;
}[] = [
  {
    value: AlignmentOptionsEnum.STEP,
    label: 'Step',
  },
  {
    value: AlignmentOptionsEnum.EPOCH,
    label: 'Epoch',
  },
  {
    value: AlignmentOptionsEnum.RELATIVE_TIME,
    label: 'Relative Time',
  },
  {
    value: AlignmentOptionsEnum.ABSOLUTE_TIME,
    label: 'Absolute Time',
  },
];

const DROPDOWN_LIST_HEIGHT = 253;

function Alignment(props: IAlignmentProps) {
  const {
    visualizationName,
    engine,
    engine: { visualizations },
    alignmentConfig,
  } = props;
  const vizEngine = visualizations[visualizationName];
  const updateAxesProps = vizEngine.controls.axesProperties.methods.update;
  const queryable = engine.useStore(engine.instructions.stateSelector);
  const data = engine.useStore(engine.pipeline.dataSelector);

  const projectSequenceOptions = getSelectFormOptions(
    queryable.project_sequence_info,
  );

  const updateAlignment = React.useCallback(
    (alignment) => {
      updateAxesProps({ alignment: { ...alignmentConfig, ...alignment } });
    },
    [updateAxesProps, alignmentConfig],
  );

  const alignmentOptions: ISelectOption[] = React.useMemo(() => {
    let metricOptions: { value: string; label: string; group: string }[] = [];
    if (projectSequenceOptions) {
      for (let option of projectSequenceOptions) {
        if (
          option?.value?.option_name &&
          option?.value?.context === null &&
          !isSystemMetric(option.value.option_name)
        ) {
          metricOptions.push({
            value: option.label,
            label: option.label,
            group: 'METRIC',
          });
        }
      }
    }
    return METRICS_ALIGNMENT_LIST.concat(metricOptions);
  }, [projectSequenceOptions]);

  const selectedAlignment = React.useMemo(
    () =>
      alignmentConfig?.type === AlignmentOptionsEnum.CUSTOM_METRIC
        ? alignmentConfig.metric
        : alignmentConfig.type,
    [alignmentConfig],
  );

  const onCustomMetricChange = React.useCallback(
    (metric: string) => {
      const groupedByRun = _.groupBy(data || [], (d) => d.run.hash);
      const runs = Object.entries(groupedByRun).map(([runHash, items]) => {
        const traces = items.map(({ data: { context, slice, name } }) => ({
          context,
          name,
          slice,
        }));
        return { run_id: runHash, traces };
      });

      const reqBody: IAlignMetricsData = { align_by: metric, runs };

      engine.pipeline.executeCustomPhase({
        createRequest: alignMetricsRequest,
        body: reqBody,
        params: { report_progress: true },
        ignoreCache: false,
        processData: (currentResult, alignedDataResponse, clearCache) => {
          const alignedDataDict: Record<
            string,
            {
              name: string;
              context: object;
              x_axis_iters: Float64Array;
              x_axis_values: Float64Array;
            }
          > = {};
          for (let run of alignedDataResponse) {
            const runHash = run.hash;
            const traces = _.omit(run, 'hash');
            for (let trace of Object.values(traces || {})) {
              const uniqKey = buildObjectHash({
                runHash,
                name: trace.name,
                context: trace.context,
              });
              alignedDataDict[uniqKey] = trace;
            }
          }

          let missingTraces = false;
          const alignedData = currentResult.objectList.map((item) => {
            const alignedDataItem = alignedDataDict[item.key];
            const x_axis_iters = alignedDataItem?.x_axis_iters || null;
            const x_axis_values = alignedDataItem?.x_axis_values || null;
            if (!x_axis_iters || !x_axis_values) {
              missingTraces = true;
            }
            return {
              ...item,
              data: {
                ...item.data,
                x_axis_iters,
                x_axis_values,
              },
            };
          });

          if (missingTraces) {
            engine.notifications.error(
              AlignmentNotificationsEnum.NOT_ALL_ALIGNED,
            );
            updateAlignment({
              type: AlignmentOptionsEnum.STEP,
              metric: '',
            });

            engine.pipeline.resetCustomPhaseArgs();
            clearCache();

            return currentResult;
          }

          return {
            ...currentResult,
            objectList: alignedData,
          };
        },
      } as CustomPhaseExecutionArgs);
    },
    [engine.pipeline, data, engine.notifications, updateAlignment],
  );

  const handleAlignmentChange = React.useCallback(
    (option: ISelectOption): void => {
      if (option) {
        if (option.group === 'METRIC') {
          updateAlignment({
            type: AlignmentOptionsEnum.CUSTOM_METRIC,
            metric: option.value,
          });
          onCustomMetricChange(option.value);
        } else {
          updateAlignment({
            type: option.value as AlignmentOptionsEnum,
            metric: '',
          });
        }
      }
    },
    [updateAlignment, onCustomMetricChange],
  );

  return (
    <div className='Alignment'>
      <Text component='p' tint={50} className='Alignment__subtitle'>
        X AXIS ALIGNMENT:
      </Text>
      <SelectDropdown
        selectOptions={alignmentOptions}
        selected={selectedAlignment}
        handleSelect={handleAlignmentChange}
        ListboxProps={{
          style: { height: DROPDOWN_LIST_HEIGHT, padding: 0 },
        }}
      />
    </div>
  );
}

export default React.memo(Alignment);
