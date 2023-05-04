import React from 'react';

import { Divider, Paper } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import {
  ITooltipContentProps,
  AppearanceActionButtons,
  RunAdditionalInfo,
  SelectedFields,
  SelectedGroupingFields,
} from './index';

import './TooltipContent.scss';

const TooltipContent = React.forwardRef(function TooltipContent(
  props: ITooltipContentProps,
  ref,
) {
  const {
    tooltipAppearance = TooltipAppearanceEnum.Auto,
    focused = false,
    onChangeTooltip,
    run,
    selectedProps,
    selectedGroupingProps,
    renderHeader,
  } = props;

  const isPopoverPinned = React.useMemo(
    () =>
      tooltipAppearance === TooltipAppearanceEnum.Top ||
      tooltipAppearance === TooltipAppearanceEnum.Bottom,
    [tooltipAppearance],
  );

  const onChangeAppearance = React.useCallback(
    (appearance: TooltipAppearanceEnum) => {
      onChangeTooltip({ appearance });
    },
    [onChangeTooltip],
  );

  return (
    <ErrorBoundary>
      <Paper
        ref={ref}
        className='TooltipContent'
        style={{ pointerEvents: focused ? 'auto' : 'none' }}
        elevation={0}
      >
        {focused && (
          <AppearanceActionButtons
            appearance={tooltipAppearance}
            onChangeAppearance={onChangeAppearance}
          />
        )}
        <div className='TooltipContent__container'>
          {isPopoverPinned ? (
            <div className='PinnedSection'>
              <div className='ScrollBar__hidden'>
                {renderHeader && renderHeader()}
                {focused && (
                  <RunAdditionalInfo
                    runHash={run?.hash}
                    experimentId={run?.experimentId}
                  />
                )}
              </div>
              <Divider orientation='vertical' />
              <div className='ScrollBar__hidden'>
                <SelectedFields
                  fields={selectedProps}
                  isPopoverPinned={isPopoverPinned}
                />
                <SelectedGroupingFields fields={selectedGroupingProps} />
              </div>
            </div>
          ) : (
            <div className='UnpinnedSection ScrollBar__hidden'>
              {renderHeader && renderHeader()}
              <SelectedFields
                fields={selectedProps}
                isPopoverPinned={isPopoverPinned}
              />
              <SelectedGroupingFields fields={selectedGroupingProps} />
              {focused && (
                <RunAdditionalInfo
                  runHash={run?.hash}
                  experimentId={run?.experimentId}
                />
              )}
            </div>
          )}
        </div>
      </Paper>
    </ErrorBoundary>
  );
});

export default React.memo(TooltipContent);
