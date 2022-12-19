import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';
import { Link as RouteLink } from 'react-router-dom';

import { Divider, Link, Paper, Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';

import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';
import { TooltipAppearance } from 'types/services/models/metrics/metricsAppModel.d';

import contextToString from 'utils/contextToString';
import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';
import { AlignmentOptionsEnum, ChartTypeEnum } from 'utils/d3';
import { formatValue } from 'utils/formatValue';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import getValueByField from 'utils/getValueByField';
import { isMetricHash } from 'utils/isMetricHash';
import { decode } from 'utils/encoder/encoder';

import './PopoverContent.scss';

const PopoverContent = React.forwardRef(function PopoverContent(
  props: IPopoverContentProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    tooltipContent,
    tooltipAppearance = TooltipAppearance.Auto,
    focusedState,
    chartType,
    alignmentConfig,
    selectOptions,
    onRunsTagsChange,
    onChangeTooltip,
  } = props;
  const {
    selectedProps = {},
    groupConfig = {},
    name = '',
    context = {},
    run,
  } = tooltipContent || {};

  const isPopoverPinned = React.useMemo(
    () =>
      tooltipAppearance === TooltipAppearance.Top ||
      tooltipAppearance === TooltipAppearance.Bottom,
    [tooltipAppearance],
  );

  function renderPopoverHeader(): React.ReactNode {
    switch (chartType) {
      case ChartTypeEnum.LineChart: {
        return (
          <ErrorBoundary>
            <div className='PopoverContent__box'>
              <div className='PopoverContent__valueContainer'>
                <Text>Y: </Text>
                <span className='PopoverContent__headerValue'>
                  <Text weight={400}>
                    {isSystemMetric(name) ? formatSystemMetricName(name) : name}
                  </Text>
                  <Text className='PopoverContent__contextValue'>
                    {contextToString(context)}
                  </Text>
                  <Text component='p' className='PopoverContent__axisValue'>
                    {focusedState?.yValue}
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
                      {contextToString(context)}
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
          </ErrorBoundary>
        );
      }
      case ChartTypeEnum.HighPlot: {
        let metricName: string = '';
        let context: string = '';
        const xValue = `${focusedState?.xValue}`;

        if (isMetricHash(xValue)) {
          const metric = JSON.parse(decode(xValue));
          metricName = metric.metricName;
          context = metric.contextName;
        } else {
          metricName = (xValue || '')?.split('-')[0];
          context = (xValue || '')?.split('-')[1];
        }

        return (
          <ErrorBoundary>
            <div className='PopoverContent__box'>
              <div className='PopoverContent__value'>
                <strong>
                  {isSystemMetric(metricName)
                    ? formatSystemMetricName(metricName)
                    : metricName ?? '--'}
                </strong>{' '}
                {context || null}
              </div>
              <div className='PopoverContent__value'>
                Value: {focusedState?.yValue}
              </div>
            </div>
          </ErrorBoundary>
        );
      }
      case ChartTypeEnum.ImageSet: {
        const {
          step = '',
          index = '',
          caption = '',
          images_name = '',
        } = tooltipContent;
        return (
          <ErrorBoundary>
            <div className='PopoverContent__box PopoverContent__imageSetBox'>
              <strong>{caption}</strong>
              <div className='PopoverContent__value'>
                <strong>{images_name}</strong>
                <Text className='PopoverContent__contextValue'>
                  {contextToString(context)}
                </Text>
              </div>
              <div className='PopoverContent__value'>
                Step: <strong>{step}</strong>
                <Text className='PopoverContent__contextValue'>
                  Index: <strong>{index}</strong>
                </Text>
              </div>
            </div>
          </ErrorBoundary>
        );
      }
      case ChartTypeEnum.ScatterPlot: {
        return (
          <ErrorBoundary>
            <div className='PopoverContent__box'>
              <div className='PopoverContent__valueContainer'>
                <Text>Y: </Text>
                <span className='PopoverContent__headerValue'>
                  <Text component='p' className='PopoverContent__axisValue'>
                    {focusedState?.yValue}
                  </Text>
                </span>
              </div>
              <div className='PopoverContent__valueContainer'>
                <Text>X: </Text>
                <span className='PopoverContent__headerValue'>
                  <Text component='p' className='PopoverContent__axisValue'>
                    {focusedState?.xValue}
                  </Text>
                </span>
              </div>
            </div>
          </ErrorBoundary>
        );
      }
      default:
        return null;
    }
  }

  function renderActionButtons(): React.ReactNode {
    if (focusedState?.active && run?.hash && onChangeTooltip) {
      return (
        <div className='PopoverContent__actionButtons'>
          <Tooltip title='Pin to top'>
            <div>
              <Button
                onClick={() =>
                  onChangeTooltip({ appearance: TooltipAppearance.Top })
                }
                withOnlyIcon
                size='xSmall'
                className={classNames(
                  'PopoverContent__actionButtons__actionButton',
                  {
                    active: tooltipAppearance === TooltipAppearance.Top,
                  },
                )}
              >
                <Icon
                  name='pin-to-top'
                  fontSize={16}
                  className='PopoverContent__actionButtons__actionButton__icon'
                />
              </Button>
            </div>
          </Tooltip>
          <Tooltip title='Flexible'>
            <div>
              <Button
                onClick={() =>
                  onChangeTooltip({ appearance: TooltipAppearance.Auto })
                }
                withOnlyIcon
                size='xSmall'
                className={classNames(
                  'PopoverContent__actionButtons__actionButton',
                  {
                    active: tooltipAppearance === TooltipAppearance.Auto,
                  },
                )}
              >
                <Icon
                  name='flexible'
                  fontSize={16}
                  className='PopoverContent__actionButtons__actionButton__icon'
                />
              </Button>
            </div>
          </Tooltip>
          <Tooltip title='Pin to bottom'>
            <div>
              <Button
                onClick={() =>
                  onChangeTooltip({ appearance: TooltipAppearance.Bottom })
                }
                withOnlyIcon
                size='xSmall'
                className={classNames(
                  'PopoverContent__actionButtons__actionButton',
                  {
                    active: tooltipAppearance === TooltipAppearance.Bottom,
                  },
                )}
              >
                <Icon
                  name='pin-to-bottom'
                  fontSize={16}
                  className='PopoverContent__actionButtons__actionButton__icon'
                />
              </Button>
            </div>
          </Tooltip>
        </div>
      );
    }
    return <></>;
  }

  function renderTags(): React.ReactNode {
    return focusedState?.active && run?.hash ? (
      <ErrorBoundary>
        <div>
          <Divider />
          <div className='PopoverContent__box'>
            <Link
              to={PathEnum.Run_Detail.replace(':runHash', run?.hash)}
              component={RouteLink}
              className='PopoverContent__runDetails'
              underline='none'
            >
              <Icon name='link' />
              <div>Run Details</div>
            </Link>
            <Link
              to={PathEnum.Experiment.replace(
                ':experimentId',
                run?.props?.experiment?.id,
              )}
              component={RouteLink}
              className='PopoverContent__runDetails'
              underline='none'
            >
              <Icon name='link' />
              <div>Experiment Detail</div>
            </Link>
          </div>
        </div>
        <div>
          <Divider />
          <div className='PopoverContent__box'>
            <ErrorBoundary>
              <AttachedTagsList
                runHash={run?.hash}
                tags={run?.props?.tags ?? []}
                onRunsTagsChange={onRunsTagsChange}
              />
            </ErrorBoundary>
          </div>
        </div>
      </ErrorBoundary>
    ) : null;
  }

  return (
    <ErrorBoundary>
      <Paper
        ref={ref}
        className='PopoverContent__container'
        style={{ pointerEvents: focusedState?.active ? 'auto' : 'none' }}
        elevation={0}
      >
        {renderActionButtons()}
        <div
          className={classNames('PopoverContent', {
            PopoverContent__pinned: isPopoverPinned,
            PopoverContent__fixed:
              focusedState?.active && run?.hash && onChangeTooltip,
          })}
        >
          <div
            className={classNames(
              'PopoverContent__boxWrapper ScrollBar__hidden',
              {
                pinned: isPopoverPinned,
              },
            )}
          >
            {renderPopoverHeader()}
            {isPopoverPinned && renderTags()}
          </div>
          {!_.isEmpty(selectedProps) || !_.isEmpty(groupConfig) ? (
            <div
              className={classNames(
                'PopoverContent__boxContainer ScrollBar__hidden',
                {
                  pinned: isPopoverPinned,
                },
              )}
            >
              {_.isEmpty(selectedProps) ? null : (
                <ErrorBoundary>
                  <div className='PopoverContent__boxWrapper'>
                    <Divider
                      orientation={isPopoverPinned ? 'vertical' : 'horizontal'}
                    />
                    <div className='PopoverContent__box ScrollBar__hidden'>
                      <div className='PopoverContent__subtitle1'>
                        Selected Fields
                      </div>
                      {Object.keys(selectedProps).map((paramKey) => (
                        <div key={paramKey} className='PopoverContent__value'>
                          <Text size={12} tint={50}>
                            {`${getValueByField(selectOptions, paramKey)}: `}
                          </Text>
                          <Text size={12}>
                            {formatValue(selectedProps[paramKey])}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </ErrorBoundary>
              )}
              {_.isEmpty(groupConfig) ? null : (
                <ErrorBoundary>
                  <div className='PopoverContent__boxWrapper'>
                    <Divider
                      orientation={isPopoverPinned ? 'vertical' : 'horizontal'}
                    />
                    <div className='PopoverContent__box ScrollBar__hidden'>
                      <div className='PopoverContent__subtitle1'>
                        Group Config
                      </div>
                      {Object.keys(groupConfig).map((groupConfigKey: string) =>
                        _.isEmpty(groupConfig[groupConfigKey]) ? null : (
                          <React.Fragment key={groupConfigKey}>
                            <div className='PopoverContent__subtitle2'>
                              {groupConfigKey}
                            </div>
                            {Object.keys(groupConfig[groupConfigKey]).map(
                              (item) => {
                                let val = isSystemMetric(
                                  groupConfig[groupConfigKey][item],
                                )
                                  ? formatSystemMetricName(
                                      groupConfig[groupConfigKey][item],
                                    )
                                  : groupConfig[groupConfigKey][item];
                                return (
                                  <div
                                    key={item}
                                    className='PopoverContent__value'
                                  >
                                    <Text
                                      size={12}
                                      tint={50}
                                    >{`${item}: `}</Text>
                                    <Text size={12}>{formatValue(val)}</Text>
                                  </div>
                                );
                              },
                            )}
                          </React.Fragment>
                        ),
                      )}
                    </div>
                  </div>
                </ErrorBoundary>
              )}
              {!isPopoverPinned && renderTags()}
            </div>
          ) : null}
        </div>
      </Paper>
    </ErrorBoundary>
  );
});

export default React.memo(PopoverContent);
