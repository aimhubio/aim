import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';

import AggregationPopover from 'components/AggregationPopover/AggregationPopover';
import SmootheningPopover from 'components/SmoothingPopover/SmoothingPopover';
import ZoomInPopover from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopover from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopover from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';
import AlignmentPopover from 'components/AxesPropsPopover/AxesPropsPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';
import ExportPreview from 'components/ExportPreview';
import ChartGrid from 'components/ChartPanel/ChartGrid';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ChartLegends from 'components/ChartPanel/ChartLegends';

import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import { IControlProps } from 'types/pages/metrics/components/Controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [openExportModal, setOpenExportModal] = React.useState<boolean>(false);

  const highlightModeChanged: boolean = React.useMemo(() => {
    return (
      props.highlightMode !== CONTROLS_DEFAULT_CONFIG.metrics.highlightMode
    );
  }, [props.highlightMode]);

  const axesScaleChanged: boolean = React.useMemo(() => {
    return (
      props.axesScaleType.xAxis !==
        CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.xAxis ||
      props.axesScaleType.yAxis !==
        CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.yAxis
    );
  }, [props.axesScaleType]);

  const alignmentChanged: boolean = React.useMemo(() => {
    return (
      props.alignmentConfig.metric !==
        CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.metric ||
      props.alignmentConfig.type !==
        CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.type ||
      props.densityType !== CONTROLS_DEFAULT_CONFIG.metrics.densityType
    );
  }, [props.alignmentConfig, props.densityType]);

  const axesRangeChanged: boolean = React.useMemo(() => {
    return !_.isEqual(
      props.axesScaleRange,
      CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange,
    );
  }, [props.axesScaleRange]);

  const tooltipChanged: boolean = React.useMemo(() => {
    return (
      props.tooltip?.appearance !==
        CONTROLS_DEFAULT_CONFIG.metrics.tooltip.appearance ||
      props.tooltip.selectedFields?.length !==
        CONTROLS_DEFAULT_CONFIG.metrics.tooltip.selectedFields.length
    );
  }, [props.tooltip]);

  const onToggleExportPreview = React.useCallback((): void => {
    setOpenExportModal((state) => !state);
  }, [setOpenExportModal]);

  return (
    <ErrorBoundary>
      <div className='Controls__container ScrollBar__hidden'>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Select aggregation method'
              open={props.aggregationConfig.isEnabled}
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip
                  title={
                    props.aggregationConfig.isApplied
                      ? 'Deaggregate metrics'
                      : 'Aggregate metrics'
                  }
                >
                  <div
                    className={classNames('Controls__anchor', {
                      active: props.aggregationConfig.isApplied,
                      outlined: props.aggregationConfig.isApplied,
                      disabled: !props.aggregationConfig.isEnabled,
                    })}
                    onClick={() => {
                      if (props.aggregationConfig.isEnabled) {
                        props.onAggregationConfigChange({
                          isApplied: !props.aggregationConfig?.isApplied,
                        });
                      }
                    }}
                  >
                    {props.aggregationConfig.isEnabled ? (
                      <span
                        className={classNames('Controls__anchor__arrow', {
                          opened,
                        })}
                        onClick={onAnchorClick}
                      >
                        <Icon name='arrow-left' fontSize={9} />
                      </span>
                    ) : null}
                    <Icon
                      name='aggregation'
                      className={classNames('Controls__icon', {
                        active: props.aggregationConfig.isApplied,
                      })}
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <AggregationPopover
                  aggregationConfig={props.aggregationConfig}
                  onChange={props.onAggregationConfigChange}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Axes properties'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Axes properties'>
                  <div
                    onClick={onAnchorClick}
                    className={classNames('Controls__anchor', {
                      active: opened || alignmentChanged || axesRangeChanged,
                      outlined:
                        !opened && (alignmentChanged || axesRangeChanged),
                    })}
                  >
                    <Icon
                      className={classNames('Controls__icon', {
                        active: opened || alignmentChanged || axesRangeChanged,
                      })}
                      name='axes-props'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <AlignmentPopover
                  selectFormOptions={props.selectFormOptions}
                  alignmentConfig={props.alignmentConfig}
                  axesScaleRange={props.axesScaleRange}
                  onAlignmentMetricChange={props.onAlignmentMetricChange}
                  onAlignmentTypeChange={props.onAlignmentTypeChange}
                  onAxesScaleRangeChange={props.onAxesScaleRangeChange}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Axes scale'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Axes scale'>
                  <div
                    onClick={onAnchorClick}
                    className={classNames('Controls__anchor', {
                      active: opened || axesScaleChanged,
                      outlined: !opened && axesScaleChanged,
                    })}
                  >
                    <Icon
                      className={classNames('Controls__icon', {
                        active: opened || axesScaleChanged,
                      })}
                      name='axes-scale'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <AxesScalePopover
                  axesScaleType={props.axesScaleType}
                  onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Chart smoothing options'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip
                  title={
                    props.smoothing.isApplied
                      ? 'Disable smoothing'
                      : 'Apply smoothing'
                  }
                >
                  <div
                    className={classNames('Controls__anchor', {
                      active: props.smoothing.isApplied,
                      outlined: props.smoothing.isApplied,
                    })}
                    onClick={() => {
                      props.onSmoothingChange({
                        isApplied: !props.smoothing?.isApplied,
                      });
                    }}
                  >
                    <span
                      className={classNames('Controls__anchor__arrow', {
                        opened,
                      })}
                      onClick={onAnchorClick}
                    >
                      <Icon name='arrow-left' fontSize={9} />
                    </span>
                    <Icon
                      className={classNames('Controls__icon', {
                        active: props.smoothing.isApplied,
                      })}
                      name='smoothing'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <SmootheningPopover
                  onSmoothingChange={props.onSmoothingChange}
                  smoothing={props.smoothing}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <Tooltip
          title={
            props.ignoreOutliers ? 'Outliers are ignored' : 'Ignore outliers'
          }
        >
          <div
            className={classNames('Controls__anchor', {
              active: props.ignoreOutliers,
              outlined: props.ignoreOutliers,
            })}
            onClick={props.onIgnoreOutliersChange}
          >
            <Icon
              className={classNames('Controls__icon', {
                active: props.ignoreOutliers,
              })}
              name='ignore-outliers'
            />
          </div>
        </Tooltip>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Highlight modes'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Highlight modes'>
                  <div
                    className={classNames('Controls__anchor', {
                      active: opened || highlightModeChanged,
                      outlined: !opened && highlightModeChanged,
                    })}
                    onClick={onAnchorClick}
                  >
                    <Icon
                      className={classNames('Controls__icon', {
                        active: opened || highlightModeChanged,
                      })}
                      name='highlight-mode'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <HighlightModePopover
                  mode={props.highlightMode}
                  onChange={props.onHighlightModeChange}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Display in tooltip'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Tooltip fields'>
                  <div
                    onClick={onAnchorClick}
                    className={classNames('Controls__anchor', {
                      active: opened || tooltipChanged,
                      outlined: !opened && tooltipChanged,
                    })}
                  >
                    <Icon
                      className={classNames('Controls__icon', {
                        active: opened || tooltipChanged,
                      })}
                      name='cursor'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <TooltipContentPopover
                  selectOptions={props.selectOptions}
                  selectedFields={props.tooltip?.selectedFields}
                  tooltipAppearance={props.tooltip?.appearance}
                  isTooltipDisplayed={props.tooltip?.display}
                  onChangeTooltip={props.onChangeTooltip}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <Tooltip
              title={
                props.legends?.display ? 'Hide legends' : 'Display legends'
              }
            >
              <div
                className={classNames('Controls__anchor', {
                  active:
                    props.legends?.display && !_.isEmpty(props.legendsData),
                  outlined:
                    props.legends?.display && !_.isEmpty(props.legendsData),
                  disabled: _.isEmpty(props.legendsData),
                })}
                onClick={() => {
                  if (!_.isEmpty(props.legendsData)) {
                    props.onLegendsChange({ display: !props.legends?.display });
                  }
                }}
              >
                <Icon
                  className={classNames('Controls__icon', {
                    active: props.legends?.display,
                  })}
                  name='chart-legends'
                />
              </div>
            </Tooltip>
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Select zoom mode'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Zoom in'>
                  <div
                    className={classNames('Controls__anchor', {
                      active: props.zoom?.active,
                    })}
                    onClick={() => {
                      if (props.zoom) {
                        props.onZoomChange?.({ active: !props.zoom.active });
                      }
                    }}
                  >
                    <span
                      className={classNames('Controls__anchor__arrow', {
                        opened,
                      })}
                      onClick={onAnchorClick}
                    >
                      <Icon name='arrow-left' fontSize={9} />
                    </span>
                    <Icon
                      className={classNames('Controls__icon', {
                        active: props.zoom?.active,
                      })}
                      name='zoom-in'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <ZoomInPopover
                  mode={props.zoom?.mode}
                  onChange={props.onZoomChange}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Select option to zoom out'
              open={!!props.zoom?.history.length}
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Zoom out'>
                  <div
                    className={classNames('Controls__anchor', {
                      disabled: !props.zoom?.history.length,
                    })}
                    onClick={() => {
                      if (props.zoom?.history.length) {
                        props.onZoomChange?.({
                          history: [...props.zoom.history].slice(0, -1),
                        });
                      }
                    }}
                  >
                    {props.zoom?.history.length ? (
                      <span
                        className={classNames('Controls__anchor__arrow', {
                          opened,
                        })}
                        onClick={onAnchorClick}
                      >
                        <Icon name='arrow-left' fontSize={9} />
                      </span>
                    ) : null}
                    <Icon className='Controls__icon' name='zoom-out' />
                  </div>
                </Tooltip>
              )}
              component={
                <ZoomOutPopover
                  zoomHistory={props.zoom?.history}
                  onChange={props.onZoomChange}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <ErrorBoundary>
          {/* TODO add ability to open modals in ControlPopover component and change the name of the ControlPopover to more general*/}
          <Tooltip title='Export chart'>
            <div className='Controls__anchor' onClick={onToggleExportPreview}>
              <Icon className='Controls__icon' name='download' />
            </div>
          </Tooltip>
          {openExportModal && (
            <ExportPreview
              withDynamicDimensions
              openModal={openExportModal}
              explorerPage='metrics'
              onToggleExportPreview={onToggleExportPreview}
              appendElement={
                !!props.legends?.display && !_.isEmpty(props.legendsData) ? (
                  <ChartLegends data={props.legendsData} readOnly />
                ) : null
              }
            >
              <ChartGrid
                readOnly
                nameKey='exportPreview'
                data={props.data}
                chartProps={props.chartProps}
                chartType={props.chartType}
              />
            </ExportPreview>
          )}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default Controls;
