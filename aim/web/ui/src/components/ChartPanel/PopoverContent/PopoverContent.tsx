import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { Divider, Link, Paper } from '@material-ui/core';
import _ from 'lodash-es';

import contextToString from 'utils/contextToString';
import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';
import { AlignmentOptionsEnum, ChartTypeEnum } from 'utils/d3';
import { PathEnum } from 'config/enums/routesEnum';
import { Icon, Text } from 'components/kit';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';
import { formatValue } from 'utils/formatValue';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

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
          <div className='PopoverContent__box'>
            <div className='PopoverContent__valueContainer'>
              <Text>Y: </Text>
              <span className='PopoverContent__headerValue'>
                <Text weight={400}>
                  {isSystemMetric(tooltipContent.metricName)
                    ? formatSystemMetricName(tooltipContent.metricName)
                    : tooltipContent.metricName}
                </Text>
                <Text className='PopoverContent__contextValue'>
                  {contextToString(tooltipContent.metricContext)}
                </Text>
                <Text component='p' className='PopoverContent__axisValue'>
                  {focusedState?.yValue ?? '--'}
                </Text>
              </span>
            </div>
            <div className='PopoverContent__valueContainer'>
              <Text>X: </Text>
              <span className='PopoverContent__headerValue'>
                <Text weight={400}>{getKeyByAlignment(alignmentConfig)}</Text>
                {alignmentConfig?.type ===
                  AlignmentOptionsEnum.CUSTOM_METRIC && (
                  <Text className='PopoverContent__contextValue'>
                    {contextToString(tooltipContent.metricContext)}
                  </Text>
                )}
                <Text component='p' className='PopoverContent__axisValue'>
                  {formatValueByAlignment({
                    xAxisTickValue: (focusedState?.xValue as number) ?? null,
                    type: alignmentConfig?.type,
                  })}
                </Text>
              </span>
            </div>
          </div>
        );
      case ChartTypeEnum.HighPlot:
        const [metric, context] = (
          (focusedState?.xValue as string) || ''
        )?.split('-');
        return (
          <div className='PopoverContent__box'>
            <div className='PopoverContent__value'>
              <strong>
                {isSystemMetric(metric)
                  ? formatSystemMetricName(metric)
                  : metric ?? '--'}
              </strong>
              {context || null}
            </div>
            <div className='PopoverContent__value'>
              Value: {focusedState?.yValue ?? '--'}
            </div>
          </div>
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
      <div className='PopoverContent'>
        {renderPopoverHeader()}
        {_.isEmpty(groupConfig) ? null : (
          <div>
            <Divider />
            <div className='PopoverContent__box'>
              <div className='PopoverContent__subtitle1'>Group Config</div>
              {Object.keys(groupConfig).map((groupConfigKey: string) =>
                _.isEmpty(groupConfig[groupConfigKey]) ? null : (
                  <React.Fragment key={groupConfigKey}>
                    <div className='PopoverContent__subtitle2'>
                      {groupConfigKey}
                    </div>
                    {Object.keys(groupConfig[groupConfigKey]).map((item) => {
                      let val = isSystemMetric(
                        groupConfig[groupConfigKey][item],
                      )
                        ? formatSystemMetricName(
                            groupConfig[groupConfigKey][item],
                          )
                        : groupConfig[groupConfigKey][item];
                      return (
                        <div key={item} className='PopoverContent__value'>
                          {item}: {val}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ),
              )}
            </div>
          </div>
        )}
        {_.isEmpty(params) ? null : (
          <div>
            <Divider />
            <div className='PopoverContent__box'>
              <div className='PopoverContent__subtitle1'>Params</div>
              {Object.keys(params).map((paramKey) => (
                <div key={paramKey} className='PopoverContent__value'>
                  {`run.${paramKey}`}: {formatValue(params[paramKey])}
                </div>
              ))}
            </div>
          </div>
        )}
        {focusedState?.active && runHash ? (
          <>
            <div>
              <Divider />
              <div className='PopoverContent__box'>
                <Link
                  to={PathEnum.Run_Detail.replace(':runHash', runHash)}
                  component={RouteLink}
                  className='PopoverContent__runDetails'
                  underline='none'
                >
                  <Icon name='link' />
                  <div>Run Details</div>
                </Link>
              </div>
            </div>
            <div>
              <Divider />
              <div className='PopoverContent__box'>
                <AttachedTagsList runHash={runHash} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Paper>
  );
});

export default React.memo(PopoverContent);
