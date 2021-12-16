import React from 'react';

import { Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';
import ImagePropertiesPopover from 'components/ImagePropertiesPopover';

import SortPopover from 'pages/Metrics/components/Table/SortPopover/SortPopover';

import { IControlProps } from 'types/pages/imagesExplore/components/Controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Controls__container ScrollBar__hidden'>
      <div>
        <ControlPopover
          title='Display In Tooltip'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Tooltip Params'>
              <div
                onClick={onAnchorClick}
                className={`Controls__anchor ${opened ? 'active' : ''}`}
              >
                <Icon
                  className={`Controls__icon ${opened ? 'active' : ''}`}
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
      <div>
        <ControlPopover
          title='Image Properties'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Image Properties'>
              <div
                onClick={onAnchorClick}
                className={`Controls__anchor ${opened ? 'active' : ''}`}
              >
                <Icon
                  className={`Controls__icon ${opened ? 'active' : ''}`}
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
          title='Images Sorting'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Images Sorting'>
              <div
                onClick={onAnchorClick}
                className={`Controls__anchor ${opened ? 'active' : ''}`}
              >
                <Icon
                  className={`Controls__icon ${opened ? 'active' : ''}`}
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
              onReset={() => {}}
            />
          }
        />
      </div>
    </div>
  );
}

export default Controls;
