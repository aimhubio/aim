import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { Box, Divider, Link, Paper, capitalize } from '@material-ui/core';
import _ from 'lodash-es';

import contextToString from 'utils/contextToString';
import formatXAxisValueByAlignment from 'utils/formatXAxisValueByAlignment';
import { ChartTypeEnum } from 'utils/d3';
import { PathEnum } from 'config/enums/routesEnum';
import Icon from 'components/Icon/Icon';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';

import './PopoverContent.scss';

function PopoverContent({
  tooltipContent,
  focusedState,
  chartType,
  alignmentConfig,
  popoverContentRef,
}: IPopoverContentProps) {
  const { params = {}, groupConfig = {}, runHash = '' } = tooltipContent;

  function renderPopoverHeader(): React.ReactNode {
    switch (chartType) {
      case ChartTypeEnum.LineChart:
        return (
          <Box paddingX='1rem' paddingY='0.625rem'>
            <div className='PopoverContent__value'>
              {capitalize(tooltipContent.metricName)}:{' '}
              {focusedState?.yValue ?? '--'}
            </div>
            <div className='PopoverContent__value'>
              Step:{' '}
              {formatXAxisValueByAlignment({
                xAxisTickValue: (focusedState?.xValue as number) ?? null,
                type: alignmentConfig?.type,
              })}{' '}
              {contextToString(tooltipContent.metricContext)}
            </div>
          </Box>
        );
      case ChartTypeEnum.HighPlot:
        const [metric, context] = (focusedState?.xValue as string)?.split('-');
        return (
          <Box paddingX='1rem' paddingY='0.625rem'>
            <div className='PopoverContent__value'>
              Value: {focusedState?.yValue ?? '--'}
            </div>
            <div className='PopoverContent__value'>
              Metric: <strong>{metric ?? '--'}</strong> {context || null}
            </div>
          </Box>
        );
      default:
        return null;
    }
  }

  return (
    <Paper
      ref={popoverContentRef}
      className='PopoverContent__container'
      style={{ pointerEvents: focusedState?.active ? 'auto' : 'none' }}
    >
      <Box className='PopoverContent'>
        {renderPopoverHeader()}
        {_.isEmpty(groupConfig) ? null : (
          <Box mt={0.5}>
            <Divider className='PopoverContent__divider' />
            <Box paddingX='1rem' paddingY='0.625rem'>
              <div className='PopoverContent__subtitle1'>Group Config</div>
              {Object.keys(groupConfig).map((groupConfigKey: string) =>
                _.isEmpty(groupConfig[groupConfigKey]) ? null : (
                  <React.Fragment key={groupConfigKey}>
                    <div className='PopoverContent__subtitle2'>
                      {groupConfigKey}
                    </div>
                    {Object.keys(groupConfig[groupConfigKey]).map((item) => (
                      <div key={item} className='PopoverContent__value'>
                        {capitalize(item)}:{' '}
                        {groupConfig[groupConfigKey][item] ?? '--'}
                      </div>
                    ))}
                  </React.Fragment>
                ),
              )}
            </Box>
          </Box>
        )}
        {_.isEmpty(params) ? null : (
          <Box mt={0.5}>
            <Divider className='PopoverContent__divider' />
            <Box paddingX='1rem' paddingY='0.625rem'>
              <div className='PopoverContent__subtitle1'>Params</div>
              {Object.keys(params).map((paramKey) => (
                <div key={paramKey} className='PopoverContent__value'>
                  {capitalize(paramKey)}:{' '}
                  {JSON.stringify(params[paramKey]) ?? '--'}
                </div>
              ))}
            </Box>
          </Box>
        )}
        {focusedState?.active && runHash ? (
          <>
            <Box>
              <Divider className='PopoverContent__divider' />
              <Box paddingX='1rem' paddingY='0.625rem'>
                <Link
                  to={PathEnum.Run_Detail.replace(':runHash', runHash)}
                  component={RouteLink}
                  className='PopoverContent__runDetails'
                  underline='none'
                >
                  <Icon name='link' />
                  <div>Run Details</div>
                </Link>
              </Box>
            </Box>
            <Box>
              <Divider className='PopoverContent__divider' />
              <Box paddingX='1rem' paddingY='0.625rem'>
                <AttachedTagsList runHash={runHash} />
              </Box>
            </Box>
          </>
        ) : null}
      </Box>
    </Paper>
  );
}

export default React.memo(PopoverContent);
