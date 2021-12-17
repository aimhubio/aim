import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import _ from 'lodash-es';

import { Divider, Link, Paper } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';

import { PathEnum } from 'config/enums/routesEnum';

import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';

import contextToString from 'utils/contextToString';
import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';
import { AlignmentOptionsEnum, ChartTypeEnum } from 'utils/d3';
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
  const { params = {}, groupConfig = {}, run } = tooltipContent;

  function renderPopoverHeader(): React.ReactNode {
    switch (chartType) {
      case ChartTypeEnum.LineChart:
        return (
          <div className='PopoverContent__box'>
            <div className='PopoverContent__valueContainer'>
              <Text>Y: </Text>
              <span className='PopoverContent__headerValue'>
                <Text weight={400}>
                  {isSystemMetric(tooltipContent.name)
                    ? formatSystemMetricName(tooltipContent.name)
                    : tooltipContent.name}
                </Text>
                <Text className='PopoverContent__contextValue'>
                  {contextToString(tooltipContent.context)}
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
                    {contextToString(tooltipContent.context)}
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
              </strong>{' '}
              {context || null}
            </div>
            <div className='PopoverContent__value'>
              Value: {focusedState?.yValue ?? '--'}
            </div>
          </div>
        );
      case ChartTypeEnum.ImageSet:
        return (
          <div className='PopoverContent__box PopoverContent__imageSetBox'>
            <strong>{tooltipContent.caption}</strong>
            <div className='PopoverContent__value'>
              <strong>{tooltipContent.images_name}</strong>
              <Text className='PopoverContent__contextValue'>
                {contextToString(tooltipContent.context)}
              </Text>
            </div>
            <div className='PopoverContent__value'>
              Step: <strong>{tooltipContent.step}</strong>
              <Text className='PopoverContent__contextValue'>
                Index: <strong>{tooltipContent.index}</strong>
              </Text>
            </div>
          </div>
        );
        break;
      case ChartTypeEnum.ScatterPlot:
        return (
          <div className='PopoverContent__box'>
            <div className='PopoverContent__valueContainer'>
              <Text>Y: </Text>
              <span className='PopoverContent__headerValue'>
                <Text component='p' className='PopoverContent__axisValue'>
                  {focusedState?.yValue ?? '--'}
                </Text>
              </span>
            </div>
            <div className='PopoverContent__valueContainer'>
              <Text>X: </Text>
              <span className='PopoverContent__headerValue'>
                <Text component='p' className='PopoverContent__axisValue'>
                  {focusedState?.xValue ?? '--'}
                </Text>
              </span>
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
                          <Text size={12} tint={50}>{`${item}: `}</Text>
                          <Text size={12}>{formatValue(val)}</Text>
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
                  <Text size={12} tint={50}>{`run.${paramKey}: `}</Text>
                  <Text size={12}>{formatValue(params[paramKey])}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
        {focusedState?.active && run?.hash ? (
          <>
            <div>
              <Divider />
              <div className='PopoverContent__box'>
                <Link
                  to={PathEnum.Run_Detail.replace(':runHash', run.hash)}
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
                <AttachedTagsList runHash={run.hash} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Paper>
  );
});

export default React.memo(PopoverContent);
