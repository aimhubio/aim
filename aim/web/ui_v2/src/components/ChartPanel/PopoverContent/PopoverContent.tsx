import React from 'react';
import { Box, Divider, Paper, Typography } from '@material-ui/core';
import _ from 'lodash-es';

import contextToString from 'utils/contextToString';
import formatXAxisValueByAlignment from 'utils/formatXAxisValueByAlignment';

import { ChartTypeEnum } from 'utils/d3';
import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';

import './PopoverContent.scss';

function PopoverContent({
  tooltipContent,
  focusedState,
  chartType,
  alignmentConfig,
}: IPopoverContentProps) {
  function renderPopoverHeader(): React.ReactNode {
    switch (chartType) {
      case ChartTypeEnum.LineChart:
        return (
          <>
            <Typography>
              {tooltipContent.metricName}: {focusedState?.yValue ?? '--'}
            </Typography>
            <Typography>
              Step:{' '}
              {formatXAxisValueByAlignment({
                xAxisTickValue: (focusedState?.xValue as number) ?? null,
                type: alignmentConfig?.type,
              })}{' '}
              {contextToString(tooltipContent.metricContext)}
            </Typography>
          </>
        );
      case ChartTypeEnum.HighPlot:
        const [metric, context] = (focusedState?.xValue as string)?.split('-');
        return (
          <>
            <Typography>Value: {focusedState?.yValue ?? '--'}</Typography>
            <Typography>
              Metric: <strong>{metric ?? '--'}</strong> {context || null}
            </Typography>
          </>
        );
      default:
        return null;
    }
  }

  const { params = {}, groupConfig = {} } = tooltipContent;
  return (
    <Paper
      className='PopoverContent__container'
      style={{ pointerEvents: focusedState?.active ? 'auto' : 'none' }}
    >
      <Box p={1}>
        {renderPopoverHeader()}
        {_.isEmpty(groupConfig) ? null : (
          <Box mt={0.5}>
            <Divider style={{ margin: '0.5em 0' }} />
            <Typography variant='subtitle1' style={{ fontWeight: 500 }}>
              Group Config
            </Typography>
            {Object.keys(groupConfig).map((groupConfigKey: string) =>
              _.isEmpty(groupConfig[groupConfigKey]) ? null : (
                <React.Fragment key={groupConfigKey}>
                  <Typography variant='subtitle2'>
                    <span style={{ textTransform: 'capitalize' }}>
                      {groupConfigKey}
                    </span>{' '}
                    params
                  </Typography>
                  {Object.keys(groupConfig[groupConfigKey]).map((item) => (
                    <Typography
                      key={item}
                      color='textSecondary'
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {item}: {groupConfig[groupConfigKey][item] ?? '--'}
                    </Typography>
                  ))}
                </React.Fragment>
              ),
            )}
          </Box>
        )}
        {_.isEmpty(params) ? null : (
          <Box mt={0.5}>
            <Divider style={{ margin: '0.5em 0' }} />
            <Typography variant='subtitle1' style={{ fontWeight: 500 }}>
              Params
            </Typography>
            {Object.keys(params).map((paramKey) => (
              <Typography
                key={paramKey}
                color='textSecondary'
                style={{ whiteSpace: 'nowrap' }}
              >
                {paramKey}: {JSON.stringify(params[paramKey]) ?? '--'}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default React.memo(PopoverContent);
