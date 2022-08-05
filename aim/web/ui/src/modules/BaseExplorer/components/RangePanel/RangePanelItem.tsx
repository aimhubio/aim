import React from 'react';
import _ from 'lodash-es';

import SliderWithInput from 'components/SliderWithInput';
import { Icon, Text } from 'components/kit';

import { IRangePanelItemProps } from './RangePanel.d';

const RangePanelItem = ({
  sliderName,
  onSubmit,
  engine,
  itemConfig,
}: IRangePanelItemProps) => {
  const ranges = engine.useStore(engine.ranges.stateSelector);
  const rangesData = engine.useStore(engine.queryableDataSelector);
  const rangeState = ranges?.[sliderName];
  const rangeLength = _.range(
    rangeState.slice?.[0] ?? 0,
    (rangeState.slice?.[1] ?? 0) + 1,
  ).length;

  const onRangeChange = React.useCallback(
    (value) => {
      const updatedRanges = {
        ...ranges,
        [sliderName]: {
          ...rangeState,
          slice: value,
        },
      };
      engine.ranges.methods.update(updatedRanges);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangeState, sliderName],
  );

  const onCountChange = React.useCallback(
    (value) => {
      const updatedRanges = {
        ...ranges,
        [sliderName]: {
          ...rangeState,
          density: value,
        },
      };
      engine.ranges.methods.update(updatedRanges);
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
    [],
  );

  return (
    <React.Fragment>
      {rangesData.ranges?.[`${sliderName}_range_total`]?.[0] !==
      rangesData.ranges?.[`${sliderName}_range_total`]?.[1] ? (
        <SliderWithInput
          sliderTitle={itemConfig.sliderTitle}
          countInputTitle={itemConfig.countInputTitle}
          countTitleTooltip={itemConfig.countTitleTooltip}
          sliderTitleTooltip={itemConfig.sliderTitleTooltip}
          min={rangesData?.ranges?.[`${sliderName}_range_total`]?.[0]}
          max={rangesData?.ranges?.[`${sliderName}_range_total`]?.[1]}
          selectedRangeValue={rangeState.slice}
          selectedCountValue={rangeState.density}
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
