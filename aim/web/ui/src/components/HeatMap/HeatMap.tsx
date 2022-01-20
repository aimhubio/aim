import React from 'react';
import { useHistory } from 'react-router-dom';

import { Tooltip } from '@material-ui/core';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import * as analytics from 'services/analytics';

import { encode } from 'utils/encoder/encoder';

import './HeatMapStyle.scss';

const cellScales: number[] = [0, 1, 2, 3, 4];
function HeatMap({
  data,
  startDate,
  endDate,
  cellSize = 12,
  cellSpacing = 4,
  scaleRange = 4,
  onCellClick,
}: any) {
  const oneDay = 24 * 60 * 60 * 1000;
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const history = useHistory();
  startDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  endDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  let firstDay = startDate;
  while (firstDay.getDay() !== 0) {
    firstDay = shiftDate(firstDay, -1);
  }

  let lastDay = endDate;
  while (lastDay.getDay() !== 0) {
    lastDay = shiftDate(lastDay, 1);
  }

  const diffDays = Math.round(Math.abs((firstDay - lastDay) / oneDay));

  const maxVal = Math.max(
    ...data?.map((i: any) => i?.[1]).filter((i: any) => Number.isInteger(i)),
  );

  const orderedMonths = [
    ...months.slice(firstDay.getMonth()),
    ...months.slice(0, firstDay.getMonth()),
  ];

  const xAxisStyles = {
    width: `${
      (diffDays / 7) * cellSize + (diffDays / 7 - 1) * cellSpacing - 50
    }px`,
  };

  const gridStyles = {
    gridTemplateColumns: `repeat(${diffDays / 7}, 1fr)`,
    gridTemplateRows: 'repeat(7, 1fr)',
    width: `${(diffDays / 7) * cellSize + (diffDays / 7 - 1) * cellSpacing}px`,
    height: `${7 * cellSize + 6 * cellSpacing}px`,
    gridColumnGap: `${cellSpacing}px`,
    gridRowGap: `${cellSpacing}px`,
  };

  function shiftDate(date: any, numDays: any) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }

  function indexToDate(index: number) {
    const x = Math.floor(index / 7);
    const y = index % 7;

    return shiftDate(firstDay, x * 7 + y);
  }

  function getItem(index: number) {
    const date = indexToDate(index);

    let item = null;
    for (let s = 0; s < data.length; s++) {
      if (
        data[s]?.[0].getFullYear() === date.getFullYear() &&
        data[s]?.[0].getMonth() === date.getMonth() &&
        data[s]?.[0].getDate() === date.getDate()
      ) {
        item = data[s];
        break;
      }
    }
    return item;
  }

  function getScale(value: number) {
    return Math.ceil((value / maxVal) * scaleRange);
  }

  function renderCell(index: number) {
    const dataItem = getItem(index);
    const date = indexToDate(index);
    const scale =
      dataItem && Number.isInteger(dataItem?.[1]) ? getScale(dataItem[1]) : 0;
    const tooltip = ` ${dataItem ? dataItem[1] : 0} tracked run${
      dataItem?.[1] !== 1 ? 's' : ''
    } on ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    function onClickeCell(e: React.MouseEvent) {
      e.stopPropagation();
      if (scale) {
        const startDate = date.getTime();
        const endDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
        ).getTime();

        const search = encode({
          query: `run.creation_time >= ${
            startDate / 1000
          } and run.creation_time <= ${endDate / 1000}`,
        });
        analytics.trackEvent('[Home][HeatMap] Activity cell click');
        history.push(`/runs?select=${search}`);
      }
    }

    return (
      <ErrorBoundary key={index}>
        <div className='CalendarHeatmap__cell__wrapper'>
          {+endDate < +indexToDate(index) ? (
            <div className='CalendarHeatmap__cell CalendarHeatmap__cell--dummy' />
          ) : (
            <Tooltip title={tooltip}>
              <div
                className={`CalendarHeatmap__cell CalendarHeatmap__cell--scale-${scale}`}
                onClick={onClickeCell}
                role='navigation'
                // className={classNames({
                //   CalendarHeatmap__cell: true,
                //   [`CalendarHeatmap__cell--scale-${scale}`]:
                //     Number.isInteger(scale),
                // })}
                // onClick={
                //   !!onCellClick ? () => onCellClick(dataItem, date, index) : null
                // }
              />
            </Tooltip>
          )}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className='CalendarHeatmap'>
      <div className='CalendarHeatmap__map'>
        <div />
        <div
          className='CalendarHeatmap__map__axis CalendarHeatmap__map__axis--x'
          style={xAxisStyles}
        >
          {orderedMonths.slice(0, 10).map((m, i) => (
            <div className='CalendarHeatmap__map__axis__tick--x' key={i}>
              {m}
            </div>
          ))}
        </div>
        <div className='CalendarHeatmap__map__axis CalendarHeatmap__map__axis--y'>
          {weekDays.map((d, i) => (
            <div className='CalendarHeatmap__map__axis__tick--y' key={i}>
              {d}
            </div>
          ))}
        </div>
        <div className='CalendarHeatmap__map__grid' style={gridStyles}>
          {[...Array(diffDays).keys()].map((index) => renderCell(index))}
        </div>
      </div>
      <div className='CalendarHeatmap__cell__info'>
        <Text size={10}>Less</Text>
        {cellScales.map((scale) => (
          <div
            key={scale}
            style={{ width: cellSize, height: cellSize }}
            className='CalendarHeatmap__cell__wrapper'
          >
            <div
              className={`CalendarHeatmap__cell CalendarHeatmap__cell--scale-${scale}`}
            />
          </div>
        ))}

        <Text size={10}>More</Text>
      </div>
    </div>
  );
}

export default HeatMap;
