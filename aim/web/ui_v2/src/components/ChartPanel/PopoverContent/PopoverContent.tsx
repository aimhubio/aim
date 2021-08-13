import React from 'react';
import { Box, Divider, Paper, Typography } from '@material-ui/core';

import { ChartTypeEnum } from 'utils/d3';

import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';

import './PopoverContent.scss';
import _ from 'lodash';

function PopoverContent({
  tooltipContent,
  focusedState,
  chartType,
}: IPopoverContentProps) {
  function renderPopoverHeader(): React.ReactNode {
    switch (chartType) {
      case ChartTypeEnum.LineChart:
        return (
          <>
            <Typography>
              {tooltipContent.metricName}: {focusedState?.yValue ?? '--'}
            </Typography>
            <Typography>Step: {focusedState?.xValue ?? '--'}</Typography>
          </>
        );
      case ChartTypeEnum.HighPlot:
        return (
          <>
            <Typography>yValue: {focusedState?.yValue ?? '--'}</Typography>
            <Typography>Step: {focusedState?.xValue ?? '--'}</Typography>
          </>
        );
      default:
        return null;
    }
  }

  const { params = {}, group_config = {} } = tooltipContent;
  return (
    <Paper
      className='PopoverContent__container'
      style={{ pointerEvents: focusedState?.active ? 'auto' : 'none' }}
    >
      <Box p={1}>
        {renderPopoverHeader()}
        {_.isEmpty(group_config) ? null : (
          <Box mt={0.5}>
            <Divider style={{ margin: '0.5em 0' }} />
            <Typography variant='subtitle1'>Group Config</Typography>
            {Object.keys(group_config).map((groupConfigKey: string) =>
              _.isEmpty(group_config[groupConfigKey]) ? null : (
                <React.Fragment key={groupConfigKey}>
                  <Typography variant='subtitle2'>
                    {groupConfigKey} params
                  </Typography>
                  {Object.keys(group_config[groupConfigKey]).map((item) => (
                    <Typography key={item}>
                      {item}: {group_config[groupConfigKey][item] ?? '--'}
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
            <Typography variant='subtitle1'>Params</Typography>
            {Object.keys(params).map((paramKey) => (
              <Typography key={paramKey}>
                {paramKey}: {params[paramKey] ?? '--'}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default PopoverContent;
