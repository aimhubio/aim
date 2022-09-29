import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';
import ImagePropertiesPopover from 'components/ImagePropertiesPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import SortPopover from 'pages/Metrics/components/Table/SortPopover/SortPopover';

import { IControlProps } from 'types/pages/imagesExplore/components/Controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const imagePropertiesChanged: boolean = React.useMemo(() => {
    const { alignmentType, mediaItemSize, imageRendering } =
      props.additionalProperties;
    return (
      alignmentType !== CONTROLS_DEFAULT_CONFIG.images.alignmentType ||
      mediaItemSize !== CONTROLS_DEFAULT_CONFIG.images.mediaItemSize ||
      imageRendering !== CONTROLS_DEFAULT_CONFIG.images.imageRendering
    );
  }, [props.additionalProperties]);

  const tooltipChanged: boolean = React.useMemo(() => {
    return (
      props.tooltip?.appearance !==
        CONTROLS_DEFAULT_CONFIG.images.tooltip.appearance ||
      props.tooltip?.selectedFields?.length !==
        CONTROLS_DEFAULT_CONFIG.images.tooltip.selectedFields.length
    );
  }, [props.tooltip]);

  const sortFieldsChanged: boolean = React.useMemo(() => {
    return (
      props.sortFields.length !==
      CONTROLS_DEFAULT_CONFIG.images.sortFields.length
    );
  }, [props.sortFields]);

  return (
    <ErrorBoundary>
      <div className='Controls__container ScrollBar__hidden'>
        <div>
          <ControlPopover
            title='Image properties'
            anchor={({ onAnchorClick, opened }) => (
              <Tooltip title='Image properties'>
                <div
                  onClick={onAnchorClick}
                  className={`Controls__anchor ${
                    opened
                      ? 'active'
                      : imagePropertiesChanged
                      ? 'active outlined'
                      : ''
                  }`}
                >
                  <Icon
                    className={`Controls__icon ${
                      opened || imagePropertiesChanged ? 'active' : ''
                    }`}
                    name='image-properties'
                  />
                </div>
              </Tooltip>
            )}
            component={
              <ImagePropertiesPopover
                additionalProperties={props.additionalProperties}
                onImageSizeChange={props.onImageSizeChange}
                onImageRenderingChange={props.onImageRenderingChange}
                onImageAlignmentChange={props.onImageAlignmentChange}
              />
            }
          />
        </div>
        <div>
          <ControlPopover
            title='Images sorting'
            anchor={({ onAnchorClick, opened }) => (
              <Tooltip title='Images sorting'>
                <div
                  onClick={onAnchorClick}
                  className={`Controls__anchor ${
                    opened
                      ? 'active'
                      : sortFieldsChanged
                      ? 'active outlined'
                      : ''
                  }`}
                >
                  <Icon
                    className={`Controls__icon ${
                      opened || sortFieldsChanged ? 'active' : ''
                    }`}
                    name='sort-outside'
                  />
                </div>
              </Tooltip>
            )}
            component={
              <SortPopover
                sortOptions={props.selectOptions}
                sortFields={props.sortFields}
                onSort={props.onImagesSortChange}
                readOnlyFieldsLabel={'GROUP BY'}
                onReset={props.onImagesSortReset}
              />
            }
          />
        </div>
        <Tooltip
          title={
            props.additionalProperties.stacking ? 'Group stacked' : 'Stack'
          }
        >
          <div
            className={classNames('Controls__anchor', {
              active: props.additionalProperties.stacking,
              outlined: props.additionalProperties.stacking,
              disabled: _.isEmpty(props.orderedMap),
            })}
            onClick={
              !_.isEmpty(props.orderedMap) ? props.onStackingToggle : _.noop
            }
          >
            <Icon
              className={classNames('Controls__icon', {
                active: props.additionalProperties.stacking,
              })}
              name='images-stacking'
            />
          </div>
        </Tooltip>
        <div>
          <ControlPopover
            title='Display in tooltip'
            anchor={({ onAnchorClick, opened }) => (
              <Tooltip title='Tooltip fields'>
                <div
                  onClick={onAnchorClick}
                  className={`Controls__anchor ${
                    opened ? 'active' : tooltipChanged ? 'active outlined' : ''
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
      </div>
    </ErrorBoundary>
  );
}

export default Controls;
