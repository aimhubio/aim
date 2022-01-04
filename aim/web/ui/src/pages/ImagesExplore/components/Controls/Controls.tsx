import React from 'react';

import { Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';
import ImagePropertiesPopover from 'components/ImagePropertiesPopover';

import {
  ImageRenderingEnum,
  MediaItemAlignmentEnum,
} from 'config/enums/imageEnums';

import { IControlProps } from 'types/pages/imagesExplore/components/Controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const imagePropertiesChanged: boolean = React.useMemo(() => {
    const { alignmentType, mediaItemSize, imageRendering } =
      props.additionalProperties;
    return (
      alignmentType !== MediaItemAlignmentEnum.Height ||
      mediaItemSize !== 25 ||
      imageRendering !== ImageRenderingEnum.Pixelated
    );
  }, [props.additionalProperties]);

  const tooltipChanged: boolean = React.useMemo(() => {
    return !props.tooltip.display || props.tooltip.selectedParams?.length > 0;
  }, [props.tooltip]);

  return (
    <div className='Controls__container ScrollBar__hidden'>
      <div>
        <ControlPopover
          title='Image Properties'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Image Properties'>
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
          title='Display In Tooltip'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Tooltip Params'>
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
              selectedParams={props.tooltip.selectedParams}
              displayTooltip={props.tooltip.display}
              onChangeTooltip={props.onChangeTooltip}
            />
          }
        />
      </div>
    </div>
  );
}

export default Controls;
