import React from 'react';
import _ from 'lodash-es';

import { Button, Icon, Text } from 'components/kit';

import { QueryFormState } from 'modules/core/engine/explorer/query/state';
import getQueryParamsFromState from 'modules/core/utils/getQueryParamsFromState';
import { IQueryableData } from 'modules/core/pipeline';

import { SequenceTypesEnum } from 'types/core/enums';

import { getRecordState } from './helpers';
import RangePanelItem from './RangePanelItem';

import { IRangePanelProps, IVisualizerRangePanelProps } from './';

import './RangePanel.scss';

function RangePanel(props: IRangePanelProps) {
  const {
    rangesData,
    engine,
    engine: { pipeline, query, useStore },
  } = props;
  const sequenceName: SequenceTypesEnum = pipeline.getSequenceName();
  const queryFormState: QueryFormState = useStore(query.form.stateSelector);
  const rangeState = useStore(query.ranges.stateSelector);
  const isFetching: boolean = useStore(pipeline.stateSelector) === 'fetching';

  const onSubmit = React.useCallback(() => {
    if (isFetching) {
      //TODO: abort request
      return;
    } else {
      query.ranges.update({
        ...rangeState,
        isApplyButtonDisabled: true,
      });
      pipeline.search({
        ...getQueryParamsFromState(
          {
            ranges: rangeState,
            form: queryFormState,
          },
          sequenceName,
        ),
        report_progress: true,
      });
    }
  }, [query, pipeline, isFetching, queryFormState, sequenceName, rangeState]);

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
    const updatedRangesState = getRecordState(rangesData, rangeState);

    //updating the ranges data and setting the apply button disability
    query.ranges.update({
      ...rangeState,
      ...updatedRangesState,
      isApplyButtonDisabled: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangesData, query]);

  const isOnlyOneStepAndIndexTracked = React.useMemo(() => {
    const ranges = rangesData?.ranges;
    const isOnlyOneStep =
      (ranges?.record_range_total &&
        ranges?.record_range_total[0] === ranges?.record_range_total[1]) ||
      !ranges?.record_range_total;
    const isOnlyOneIndex =
      (ranges?.index_range_total &&
        ranges?.index_range_total[0] === ranges?.index_range_total[1]) ||
      !ranges?.index_range_total;
    return isOnlyOneStep && isOnlyOneIndex;
  }, [rangesData]);
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
                rangesData={rangesData}
              />
            )}
            {rangeState?.index?.slice && (
              <RangePanelItem
                sliderName={'index'}
                itemConfig={indexItemConfig}
                onSubmit={onSubmit}
                engine={engine}
                ranges={rangeState}
                rangesData={rangesData}
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
                {`1 ${rangesData?.ranges?.record_range_total ? 'step' : ''} ${
                  rangesData?.ranges?.record_range_total &&
                  rangesData?.ranges?.index_range_total
                    ? ' and '
                    : ''
                } ${rangesData?.ranges?.index_range_total ? 'index' : ''}`}
              </Text>
              logged.
            </Text>
          </div>
        )}
      </div>
    </form>
  );
}

function VisualizerRangePanel(props: IVisualizerRangePanelProps) {
  const {
    engine: { useStore, pipeline },
  } = props;

  const rangesData: IQueryableData = useStore(pipeline.queryableDataSelector);
  return _.isEmpty(rangesData) ? null : (
    <RangePanel {...props} rangesData={rangesData} />
  );
}

VisualizerRangePanel.displayName = 'VisualizerRangePanel';

export default React.memo(VisualizerRangePanel);
