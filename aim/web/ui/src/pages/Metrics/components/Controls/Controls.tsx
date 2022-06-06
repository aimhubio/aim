import React from 'react';

import { Tooltip } from '@material-ui/core';

import AggregationPopup from 'components/AggregationPopover/AggregationPopover';
import SmootheningPopup from 'components/SmoothingPopover/SmoothingPopover';
import ZoomInPopup from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopup from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopup from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';
import AlignmentPopover from 'components/AlignmentPopover/AlignmentPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';
import ExportPreview from 'components/ExportPreview';
import ChartGrid from 'components/ChartPanel/ChartGrid';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

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

  const smootheningChanged: boolean = React.useMemo(() => {
    return (
      props.smoothingFactor !==
        CONTROLS_DEFAULT_CONFIG.metrics.smoothingFactor ||
      props.curveInterpolation !==
        CONTROLS_DEFAULT_CONFIG.metrics.curveInterpolation ||
      props.smoothingAlgorithm !==
        CONTROLS_DEFAULT_CONFIG.metrics.smoothingAlgorithm
    );
  }, [
    props.smoothingAlgorithm,
    props.smoothingFactor,
    props.curveInterpolation,
  ]);

  const tooltipChanged: boolean = React.useMemo(() => {
    return (
      props.tooltip.display !==
        CONTROLS_DEFAULT_CONFIG.metrics.tooltip.display ||
      props.tooltip.selectedFields.length !==
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
                    className={`Controls__anchor ${
                      props.aggregationConfig.isApplied ? 'active outlined' : ''
                    } ${props.aggregationConfig.isEnabled ? '' : 'disabled'}`}
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
                        className={`Controls__anchor__arrow ${
                          opened ? 'Controls__anchor__arrow--opened' : ''
                        }`}
                        onClick={onAnchorClick}
                      >
                        <Icon name='arrow-left' onClick={onAnchorClick} />
                      </span>
                    ) : null}
                    <Icon
                      className={`Controls__icon ${
                        props.aggregationConfig.isApplied ? 'active' : ''
                      }`}
                      name='aggregation'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <AggregationPopup
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
              title='X-Axis properties'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='X-Axis properties'>
                  <div
                    onClick={onAnchorClick}
                    className={`Controls__anchor ${
                      opened
                        ? 'active'
                        : alignmentChanged
                        ? 'active outlined'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`Controls__icon ${
                        opened || alignmentChanged ? 'active' : ''
                      }`}
                      name='x-axis'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <AlignmentPopover
                  selectFormOptions={props.selectFormOptions}
                  alignmentConfig={props.alignmentConfig}
                  densityType={props.densityType}
                  onAlignmentMetricChange={props.onAlignmentMetricChange}
                  onAlignmentTypeChange={props.onAlignmentTypeChange}
                  onDensityTypeChange={props.onDensityTypeChange}
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
                    className={`Controls__anchor ${
                      opened
                        ? 'active'
                        : axesScaleChanged
                        ? 'active outlined'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`Controls__icon ${
                        opened || axesScaleChanged ? 'active' : ''
                      }`}
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
                <Tooltip title='Chart smoothing options'>
                  <div
                    onClick={onAnchorClick}
                    className={`Controls__anchor ${
                      opened
                        ? 'active'
                        : smootheningChanged
                        ? 'active outlined'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`Controls__icon ${
                        opened || smootheningChanged ? 'active' : ''
                      }`}
                      name='smoothing'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <SmootheningPopup
                  onSmoothingChange={props.onSmoothingChange}
                  smoothingAlgorithm={props.smoothingAlgorithm}
                  curveInterpolation={props.curveInterpolation}
                  smoothingFactor={props.smoothingFactor}
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
            className={`Controls__anchor ${
              props.ignoreOutliers ? 'active outlined' : ''
            }`}
            onClick={props.onIgnoreOutliersChange}
          >
            {props.ignoreOutliers ? (
              <Icon
                className={`Controls__icon ${
                  props.ignoreOutliers ? 'active' : ''
                }`}
                name='ignore-outliers'
              />
            ) : (
              <Icon className='Controls__icon' name='ignore-outliers' />
            )}
          </div>
        </Tooltip>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Highlight modes'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Highlight modes'>
                  <div
                    className={`Controls__anchor ${
                      opened
                        ? 'active'
                        : highlightModeChanged
                        ? 'active outlined'
                        : ''
                    }`}
                    onClick={onAnchorClick}
                  >
                    <Icon
                      className={`Controls__icon ${
                        opened || highlightModeChanged ? 'active' : ''
                      }`}
                      name='highlight-mode'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <HighlightModePopup
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
                    className={`Controls__anchor ${
                      opened
                        ? 'active'
                        : tooltipChanged
                        ? 'active outlined'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`Controls__icon ${
                        opened || tooltipChanged ? 'active' : ''
                      }`}
                      name='cursor'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <TooltipContentPopover
                  selectOptions={props.selectOptions}
                  selectedFields={props.tooltip.selectedFields}
                  displayTooltip={props.tooltip.display}
                  onChangeTooltip={props.onChangeTooltip}
                />
              }
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ControlPopover
              title='Select zoom mode'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip title='Zoom in'>
                  <div
                    className={`Controls__anchor ${
                      props.zoom?.active ? 'active' : ''
                    }`}
                    onClick={() => {
                      if (props.zoom) {
                        props.onZoomChange?.({ active: !props.zoom.active });
                      }
                    }}
                  >
                    <span
                      className={`Controls__anchor__arrow ${
                        opened ? 'Controls__anchor__arrow--opened' : ''
                      }`}
                      onClick={onAnchorClick}
                    >
                      <Icon name='arrow-left' />
                    </span>
                    <Icon
                      className={`Controls__icon ${
                        props.zoom?.active ? 'active' : ''
                      }`}
                      name='zoom-in'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <ZoomInPopup
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
                    className={`Controls__anchor ${
                      props.zoom?.history.length ? '' : 'disabled'
                    }`}
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
                        className={`Controls__anchor__arrow ${
                          opened ? 'Controls__anchor__arrow--opened' : ''
                        }`}
                        onClick={onAnchorClick}
                      >
                        <Icon name='arrow-left' />
                      </span>
                    ) : null}
                    <Icon className='Controls__icon' name='zoom-out' />
                  </div>
                </Tooltip>
              )}
              component={
                <ZoomOutPopup
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
