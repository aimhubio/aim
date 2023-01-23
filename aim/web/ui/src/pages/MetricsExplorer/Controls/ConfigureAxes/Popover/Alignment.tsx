import React from 'react';

import { SelectDropdown, Text } from 'components/kit';
import { ISelectDropdownOption as ISelectOption } from 'components/kit/SelectDropdown';

import { getSelectFormOptions } from 'modules/core/utils/getSelectFormOptions';

import { isSystemMetric } from 'utils/isSystemMetric';
import { AlignmentOptionsEnum } from 'utils/d3';

import { IAlignmentProps } from './';

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
  // const data = engine.useStore(engine.pipeline.dataSelector);

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

  const handleAlignmentChange = React.useCallback(
    (option: ISelectOption): void => {
      if (option) {
        if (option.group === 'METRIC') {
          updateAlignment({
            type: AlignmentOptionsEnum.CUSTOM_METRIC,
            metric: option.value,
          });

          // onCustomMetricChange(option.value);
        } else {
          updateAlignment({
            type: option.value as AlignmentOptionsEnum,
            metric: '',
          });
        }
      }
    },
    [updateAlignment],
  );

  // const onCustomMetricChange = React.useCallback((metric: string) => {
  //   const groupedByRun = _.groupBy(data || [], (d) => d.run.hash);
  //   const runs = Object.entries(groupedByRun).map(([runHash, items]) => {
  //     const traces = items.map(({ data: { context, slice, name } }) => ({
  //       context,
  //       name,
  //       slice,
  //     }));
  //     return { run_id: runHash, traces };
  //   });
  //
  //   const reqBody: IAlignMetricsData = {
  //     align_by: metric,
  //     runs,
  //   };
  //
  //   alignMetrics(reqBody).call();
  // }, []);

  /**
   * Function to align the metrics
   * @param {IAlignMetricsData} reqBody
   */
  // function alignMetrics(reqBody: IAlignMetricsData) {
  //   const request = alignMetricsRequest();
  //   return {
  //     abort: request.cancel,
  //     call: () => {
  //       return request
  //         .call(reqBody)
  //         .then(async (stream) => {
  //           parseStream(stream, {
  //             callback: (object) => {
  //               console.log('parseStream', object);
  //             },
  //           });
  //           return Promise.resolve();
  //         })
  //         .catch((ex) => {
  //           if (ex.name === 'AbortError') {
  //             // Abort Error
  //           } else {
  //             // eslint-disable-next-line no-console
  //             console.log('Unhandled error: ', ex);
  //           }
  //         });
  //     },
  //   };
  // }

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
