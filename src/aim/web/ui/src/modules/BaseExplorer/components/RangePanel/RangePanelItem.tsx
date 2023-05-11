import React from 'react';
import _ from 'lodash-es';

import SliderWithInput from 'components/SliderWithInput';
import { Icon, Text } from 'components/kit';

import { IRangePanelItemProps, IRangeState } from './RangePanel.d';

const RangePanelItem = ({
  sliderName,
  onSubmit,
  engine,
  itemConfig,
  ranges,
  rangesData,
}: IRangePanelItemProps) => {
  const rangeState: IRangeState | undefined = ranges[sliderName];
  const keyOfRangeTotal:
    | 'record_range_total'
    | 'index_range_total' = `${sliderName}_range_total`;

  const rangeLength: number = _.range(
    rangesData.ranges?.[keyOfRangeTotal]?.[0] as number,
    (rangesData.ranges?.[keyOfRangeTotal]?.[1] as number) + 1,
  ).length;

  const onRangeChange = React.useCallback(
    (value) => {
      const updatedRanges = {
        ...ranges,
        [sliderName]: {
          ...rangeState,
          slice: value,
        },
        isApplyButtonDisabled: false,
      };
      engine.query.ranges.update(updatedRanges);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangeState, sliderName],
  );

  const onCountChange = React.useCallback(
    (value, metadata) => {
      const updatedRanges = {
        ...ranges,
        [sliderName]: {
          ...rangeState,
          density: value,
        },
        isApplyButtonDisabled: !metadata.isValid,
        isInputInvalid: !metadata.isValid,
      };
      engine.query.ranges.update(updatedRanges);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangeState, sliderName],
  );

  const inputValidationPatterns = React.useMemo(
    () => [
      {
        errorCondition: (value: string | number) => +value <= 0,
        errorText: `Value should be greater then ${0}`,
      },
      {
        errorCondition: (value: string | number) => {
          return +value > rangeLength;
        },
        errorText: `Value should be smaller then ${rangeLength + 1}`,
      },
    ],
    [rangeLength],
  );

  return (
    <React.Fragment>
      {rangesData.ranges?.[keyOfRangeTotal]?.[0] !==
      rangesData.ranges?.[keyOfRangeTotal]?.[1] ? (
        <SliderWithInput
          sliderTitle={itemConfig.sliderTitle}
          countInputTitle={itemConfig.countInputTitle}
          countTitleTooltip={itemConfig.countTitleTooltip}
          sliderTitleTooltip={itemConfig.sliderTitleTooltip}
          min={rangesData?.ranges?.[keyOfRangeTotal]?.[0] ?? 0}
          max={rangesData?.ranges?.[keyOfRangeTotal]?.[1] ?? 0}
          selectedRangeValue={rangeState?.slice ?? [0, 0]}
          selectedCountValue={rangeState?.density ?? 0}
          onSearch={onSubmit}
          onRangeChange={onRangeChange}
          onCountChange={onCountChange}
          inputValidationPatterns={inputValidationPatterns}
        />
      ) : (
        <div className='InfoMassageBox'>
          <Icon name='circle-info' color={'#1473E6'} />
          <Text size={11} tint={80} weight={500}>
            You have only
            <Text
              size={11}
              tint={80}
              weight={600}
              className='InfoMessageBoldText'
            >
              1 {itemConfig.type}
            </Text>
            logged.
          </Text>
        </div>
      )}
      <div className='VerticalDivider' />
    </React.Fragment>
  );
};

export default React.memo<any>(RangePanelItem);
