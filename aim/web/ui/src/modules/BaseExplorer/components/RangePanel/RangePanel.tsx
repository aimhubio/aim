import React from 'react';
import _ from 'lodash-es';

import { QueryUIStateUnit } from 'modules/BaseExplorerCore/core-store';
import { getQueryFromRanges } from 'modules/BaseExplorerCore/utils/getQueryFromRanges';

import { Button } from 'components/kit';

import { SequenceTypesEnum } from 'types/core/enums';

import { formatValue } from 'utils/formatValue';

import RangePanelItem from './RangePanelItem';

import './RangePanel.scss';

// @TODO: move to utils function directory
function getQueryStringFromSelect(
  queryData: QueryUIStateUnit,
  sequenceName: SequenceTypesEnum,
): string {
  let query = '';
  if (queryData !== undefined) {
    if (queryData.advancedModeOn) {
      query = queryData.advancedInput || '';
    } else {
      query = `${
        queryData.simpleInput ? `${queryData.simpleInput} and ` : ''
      }(${queryData.selections
        .map(
          (option) =>
            `(${sequenceName}.name == "${option.value?.option_name}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map(
                      (item) =>
                        `${sequenceName}.context.${item} == ${formatValue(
                          (option.value?.context)[item],
                        )}`,
                    )
                    .join(' and ')
            })`,
        )
        .join(' or ')})`.trim();
    }
  }
  return query;
}

function RangePanel(props: any) {
  const engine = props.engine;
  const sequenceName: SequenceTypesEnum = engine.useStore(
    engine.sequenceNameSelector,
  );
  const isFetching: boolean =
    engine.useStore(engine.pipelineStatusSelector) === 'fetching';
  const query: QueryUIStateUnit = engine.useStore(engine.queryUI.stateSelector);
  const rangeState = engine.useStore(engine.ranges.stateSelector);

  const onSubmit = React.useCallback(() => {
    if (isFetching) {
      //TODO: abort request
      return;
    } else {
      engine.search({
        q: getQueryStringFromSelect(query, sequenceName),
        report_progress: false,
        ...getQueryFromRanges(rangeState),
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
    const ranges: {
      record?: { slice: [number, number]; density: number };
      index?: { slice: [number, number]; density: number };
    } = {};
    if (props.rangesData?.ranges?.record_range_total) {
      const { record_range_used, record_range_total } =
        props.rangesData?.ranges;
      const slice: [number, number] = [
        _.inRange(
          record_range_used[0],
          record_range_total[0] - 1,
          record_range_total[1] + 1,
        )
          ? record_range_used[0]
          : record_range_total[0],
        _.inRange(
          record_range_used[1],
          record_range_total[0] - 1,
          record_range_total[1] + 1,
        )
          ? record_range_used[1]
          : record_range_total[1],
      ];
      const recordRangeTotalCount =
        record_range_total[1] - record_range_total[0];
      const recordDensity = rangeState.record?.density ?? '50';
      const density =
        recordDensity ||
        recordDensity < record_range_total[0] ||
        recordDensity > recordRangeTotalCount
          ? `${recordRangeTotalCount === 0 ? 1 : recordRangeTotalCount}`
          : recordDensity;
      ranges.record = { density, slice };
    }
    if (props.rangesData?.ranges?.index_range_total) {
      const { index_range_total, index_range_used } = props.rangesData?.ranges;
      const slice: [number, number] = [
        _.inRange(
          index_range_used[0],
          index_range_total[0] - 1,
          index_range_total[1] + 1,
        )
          ? index_range_used[0]
          : index_range_total[0],
        _.inRange(
          index_range_used[1],
          index_range_total[0] - 1,
          index_range_total[1] + 1,
        )
          ? index_range_used[1]
          : index_range_total[1],
      ];
      const indexRangeTotalCount = index_range_total[1] - index_range_total[0];
      const indexDensity = rangeState.index?.density ?? '5';
      const density =
        indexDensity ||
        indexDensity < index_range_total[0] ||
        indexDensity > indexRangeTotalCount
          ? `${indexRangeTotalCount === 0 ? 1 : indexRangeTotalCount}`
          : indexDensity;
      ranges.index = { density, slice };
    }
    engine.ranges.methods.update({ ...rangeState, ...ranges });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {rangeState?.record?.slice && (
          <RangePanelItem
            sliderName={'record'}
            itemConfig={stepItemConfig}
            onSubmit={onSubmit}
            engine={engine}
          />
        )}
        {rangeState?.index?.slice && (
          <RangePanelItem
            sliderName={'index'}
            itemConfig={indexItemConfig}
            onSubmit={onSubmit}
            engine={engine}
          />
        )}
        <div className='ApplyButtonContainer'>
          <Button
            size='small'
            color='primary'
            variant='contained'
            type='submit'
            className='ApplyButton'
            disabled={false}
          >
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}

RangePanel.displayName = 'RangePanel';

export default React.memo<any>(RangePanel);
