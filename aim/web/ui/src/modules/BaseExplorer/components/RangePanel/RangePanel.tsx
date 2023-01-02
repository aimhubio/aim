import React from 'react';

import { Button, Icon, Text } from 'components/kit';

import { QueryFormState } from 'modules/core/engine/explorer/query/state';
import getQueryParamsFromState from 'modules/core/utils/getQueryParamsFromState';

import { SequenceTypesEnum } from 'types/core/enums';

import { getRecordState } from './helpers';
import RangePanelItem from './RangePanelItem';

import { IRangePanelProps } from './';

import './RangePanel.scss';

function RangePanel(props: IRangePanelProps) {
  const engine = props.engine;
  const sequenceName: SequenceTypesEnum = engine.pipeline.getSequenceName();
  const query: QueryFormState = engine.useStore(
    engine.query.form.stateSelector,
  );
  const rangeState = engine.useStore(engine.query.ranges.stateSelector);
  const isFetching: boolean =
    engine.useStore(engine.pipeline.stateSelector) === 'fetching';

  const onSubmit = React.useCallback(() => {
    if (isFetching) {
      //TODO: abort request
      return;
    } else {
      engine.query.ranges.update({
        ...rangeState,
        isApplyButtonDisabled: true,
      });
      engine.pipeline.search({
        ...getQueryParamsFromState(
          {
            ranges: rangeState,
            form: query,
          },
          sequenceName,
        ),
        report_progress: true,
      });
    }
  }, [engine, isFetching, query, sequenceName, rangeState]);

  const stepItemConfig = React.useMemo(
    () => ({
      sliderTitle: 'Steps',
      countInputTitle: 'Steps count',
      countTitleTooltip: 'Number of steps to display',
      sliderTitleTooltip:
        'Training step. Increments every time track() is called',
      type: 'step',
    }),
    [],
  );

  const indexItemConfig = React.useMemo(
    () => ({
      sliderTitle: 'Indices',
      countInputTitle: 'Indices count',
      countTitleTooltip: `Number of ${sequenceName} per step`,
      sliderTitleTooltip: `Index in the list of ${sequenceName} passed to track() call`,
      type: 'index',
    }),
    [sequenceName],
  );

  React.useEffect(() => {
    // creating the empty ranges state
    const updatedRangesState = getRecordState(props.rangesData, rangeState);

    //updating the ranges data and setting the apply button disability
    engine.query.ranges.update({
      ...rangeState,
      ...updatedRangesState,
      isApplyButtonDisabled: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.rangesData]);

  const isOnlyOneStepAndIndexTracked = React.useMemo(() => {
    const ranges = props.rangesData?.ranges;
    const isOnlyOneStep =
      (ranges?.record_range_total &&
        ranges?.record_range_total[0] === ranges?.record_range_total[1]) ||
      !ranges?.record_range_total;
    const isOnlyOneIndex =
      (ranges?.index_range_total &&
        ranges?.index_range_total[0] === ranges?.index_range_total[1]) ||
      !ranges?.index_range_total;
    return isOnlyOneStep && isOnlyOneIndex;
  }, [props.rangesData]);
  return (
    <form
      className='RangePanel'
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className='RangePanelContainer'>
        {!isOnlyOneStepAndIndexTracked ? (
          <>
            {rangeState?.record?.slice && (
              <RangePanelItem
                sliderName={'record'}
                itemConfig={stepItemConfig}
                onSubmit={onSubmit}
                engine={engine}
                ranges={rangeState}
                rangesData={props.rangesData}
              />
            )}
            {rangeState?.index?.slice && (
              <RangePanelItem
                sliderName={'index'}
                itemConfig={indexItemConfig}
                onSubmit={onSubmit}
                engine={engine}
                ranges={rangeState}
                rangesData={props.rangesData}
              />
            )}
            <div className='ApplyButtonContainer'>
              <Button
                size='small'
                color='primary'
                variant='contained'
                type='submit'
                className='ApplyButton'
                disabled={rangeState?.isApplyButtonDisabled || isFetching}
              >
                Apply
              </Button>
            </div>
          </>
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
                {`1 ${
                  props.rangesData?.ranges?.record_range_total ? 'step' : ''
                } ${
                  props.rangesData?.ranges?.record_range_total &&
                  props.rangesData?.ranges?.index_range_total
                    ? ' and '
                    : ''
                } ${
                  props.rangesData?.ranges?.index_range_total ? 'index' : ''
                }`}
              </Text>
              logged.
            </Text>
          </div>
        )}
      </div>
    </form>
  );
}

RangePanel.displayName = 'RangePanel';

export default React.memo<any>(RangePanel);
