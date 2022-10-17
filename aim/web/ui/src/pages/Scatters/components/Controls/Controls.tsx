import React from 'react';

import { Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';
import TrendlineOptionsPopover from 'components/TrendlineOptionsPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ExportPreview from 'components/ExportPreview';
import ChartGrid from 'components/ChartPanel/ChartGrid';

import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import { IControlProps } from 'types/pages/scatters/components/Controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [openExportModal, setOpenExportModal] = React.useState<boolean>(false);

  const tooltipChanged: boolean = React.useMemo(() => {
    return (
      props.tooltip?.appearance !==
        CONTROLS_DEFAULT_CONFIG.scatters.tooltip.appearance ||
      props.tooltip?.selectedFields?.length !==
        CONTROLS_DEFAULT_CONFIG.scatters.tooltip.selectedFields.length
    );
  }, [props.tooltip]);

  const onToggleExportPreview = React.useCallback((): void => {
    setOpenExportModal((state) => !state);
  }, [setOpenExportModal]);

  return (
    <ErrorBoundary>
      <div className='Controls__container'>
        <ErrorBoundary>
          <div>
            <ControlPopover
              title='Select trendline options'
              anchor={({ onAnchorClick, opened }) => (
                <Tooltip
                  title={
                    props.trendlineOptions.isApplied
                      ? 'Hide trendline'
                      : 'Show trendline'
                  }
                >
                  <div
                    className={`Controls__anchor ${
                      props.trendlineOptions.isApplied ? 'active outlined' : ''
                    }`}
                    onClick={() => {
                      props.onChangeTrendlineOptions({
                        isApplied: !props.trendlineOptions?.isApplied,
                      });
                    }}
                  >
                    <span
                      className={`Controls__anchor__arrow ${
                        opened ? 'Controls__anchor__arrow--opened' : ''
                      }`}
                      onClick={onAnchorClick}
                    >
                      <Icon name='arrow-left' fontSize={9} />
                    </span>
                    <Icon
                      className={`Controls__icon ${
                        props.trendlineOptions.isApplied ? 'active' : ''
                      }`}
                      name='trendline'
                    />
                  </div>
                </Tooltip>
              )}
              component={
                <TrendlineOptionsPopover
                  trendlineOptions={props.trendlineOptions}
                  onChangeTrendlineOptions={props.onChangeTrendlineOptions}
                />
              }
            />
          </div>
        </ErrorBoundary>
        <ErrorBoundary>
          <div>
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
                  selectedFields={props.tooltip?.selectedFields}
                  tooltipAppearance={props.tooltip?.appearance}
                  isTooltipDisplayed={props.tooltip?.display}
                  onChangeTooltip={props.onChangeTooltip}
                />
              }
            />
          </div>
        </ErrorBoundary>
        <ErrorBoundary>
          {/* TODO add ability to open modals in ControlPopover component and change the name of the ControlPopover to more general*/}
          <Tooltip title='Export chart'>
            <div className='Controls__anchor' onClick={onToggleExportPreview}>
              <Icon className='Controls__icon' name='download' />
            </div>
          </Tooltip>
          {openExportModal && (
            <ExportPreview
              openModal={openExportModal}
              withDynamicDimensions
              explorerPage='scatters'
              onToggleExportPreview={onToggleExportPreview}
            >
              <ChartGrid
                nameKey='exportPreview'
                data={props.data}
                chartProps={props.chartProps}
                chartType={props.chartType}
                readOnly
              />
            </ExportPreview>
          )}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default Controls;
