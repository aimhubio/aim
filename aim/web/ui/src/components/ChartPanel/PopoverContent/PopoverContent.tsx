import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { Box, Divider, Link, Paper } from '@material-ui/core';
import _ from 'lodash-es';

import contextToString from 'utils/contextToString';
import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';
import { ChartTypeEnum } from 'utils/d3';
import { PathEnum } from 'config/enums/routesEnum';
import { Icon, Text } from 'components/kit';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';
import { formatValue } from 'utils/formatValue';

import './PopoverContent.scss';

const PopoverContent = React.forwardRef(function PopoverContent(
  props: IPopoverContentProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    tooltipContent = {},
    focusedState,
    chartType,
    alignmentConfig,
  } = props;
  const { params = {}, groupConfig = {}, runHash = '' } = tooltipContent;

  function renderPopoverHeader(): React.ReactNode {
    switch (chartType) {
      case ChartTypeEnum.LineChart:
        return (
          <Box paddingX='1rem' paddingY='0.625rem'>
            <div className='PopoverContent__value'>
              <Text>{tooltipContent.metricName}</Text>
              <Text style={{ marginLeft: '0.5rem' }} weight={400}>
                {contextToString(tooltipContent.metricContext)}
              </Text>
              <Text component='p' style={{ marginTop: '0.125rem' }}>
                {focusedState?.yValue ?? '--'}
              </Text>
            </div>
            <div className='PopoverContent__value'>
              <Text>{getKeyByAlignment(alignmentConfig)}</Text>
              <Text style={{ marginLeft: '0.5rem' }} weight={400}>
                {contextToString(tooltipContent.metricContext)}
              </Text>
              <Text component='p' style={{ marginTop: '0.125rem' }}>
                {formatValueByAlignment({
                  xAxisTickValue: (focusedState?.xValue as number) ?? null,
                  type: alignmentConfig?.type,
                })}
              </Text>
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
              <strong>{metric ?? '--'}</strong> {context || null}
            </div>
          </Box>
        );
      default:
        return null;
    }
  }

  return (
    <Paper
      ref={ref}
      className='PopoverContent__container'
      style={{ pointerEvents: focusedState?.active ? 'auto' : 'none' }}
    >
      <Box className='PopoverContent'>
        {renderPopoverHeader()}
        {_.isEmpty(groupConfig) ? null : (
          <Box>
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
                        {item}:{' '}
                        {groupConfig[groupConfigKey][item] ??
                          formatValue(groupConfig[groupConfigKey][item])}
                      </div>
                    ))}
                  </React.Fragment>
                ),
              )}
            </Box>
          </Box>
        )}
        {_.isEmpty(params) ? null : (
          <Box>
            <Divider className='PopoverContent__divider' />
            <Box paddingX='1rem' paddingY='0.625rem'>
              <div className='PopoverContent__subtitle1'>Params</div>
              {Object.keys(params).map((paramKey) => (
                <div key={paramKey} className='PopoverContent__value'>
                  {`run.${paramKey}`}:{' '}
                  {params[paramKey] ?? formatValue(params[paramKey])}
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
});

export default React.memo(PopoverContent);
