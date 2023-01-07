import React from 'react';

import Popover from 'components/kit_v2/Popover';
import ControlsButton from 'components/kit_v2/ControlsButton';
import IconButton from 'components/kit_v2/IconButton';

import { styled } from 'config/stitches/stitches.config';

const ControlsPanelContainer = styled('div', {
  display: 'flex',
  p: '$3 $7',
  bs: '0px 3px 4px rgba(0, 0, 0, 0.05), 0px 3px 3px rgba(0, 0, 0, 0.08);',
});

const GroupingContainer = styled('div', {
  display: 'flex',
  ai: 'center',
  gap: '$3',
  flex: 1,
});

const GroupingText = styled('span', {
  color: '$textPrimary',
  fontSize: '$2',
  mr: '$2',
});

const ControlsContainer = styled('div', {
  display: 'flex',
  gap: '$3',
});

function ControlsBar() {
  return (
    <ControlsPanelContainer>
      <GroupingContainer>
        <GroupingText>Group by:</GroupingText>
        <Popover
          trigger={({ open }) => (
            <ControlsButton open={open}>Color</ControlsButton>
          )}
          content={<div>Color</div>}
        />
        <Popover
          trigger={({ open }) => (
            <ControlsButton open={open}>Stroke</ControlsButton>
          )}
          content={<div>Color</div>}
        />
        <Popover
          trigger={({ open }) => (
            <ControlsButton
              appliedValuesCount={1}
              open={open}
              rightIcon={{ name: 'eye-fill-show', onClick: () => {} }}
            >
              Chart
            </ControlsButton>
          )}
          content={<div>Color</div>}
        />
      </GroupingContainer>
      <ControlsContainer>
        <Popover
          trigger={({ open }) => (
            <ControlsButton leftIcon='aggregation' open={open}>
              Aggregate
            </ControlsButton>
          )}
          content={<div>Aggregate</div>}
        />
        <Popover
          trigger={({ open }) => (
            <ControlsButton
              leftIcon='ignore-outliers'
              hasAppliedValues
              open={open}
            >
              Ignore Outliers
            </ControlsButton>
          )}
          content={<div>Outliers</div>}
        />
        <Popover
          trigger={({ open }) => (
            <ControlsButton leftIcon='axes-props' open={open}>
              Configure axes
            </ControlsButton>
          )}
          content={<div>Axes Props</div>}
        />
        <Popover
          trigger={({ open }) => (
            <ControlsButton leftIcon='smoothing' open={open}>
              Smoothing
            </ControlsButton>
          )}
          content={<div>Smoothing</div>}
        />
        <Popover
          trigger={({ open }) => (
            <ControlsButton leftIcon='highlight-mode' open={open}>
              Highlight
            </ControlsButton>
          )}
          content={<div>Highlight</div>}
        />
        <Popover
          trigger={({ open }) => (
            <ControlsButton leftIcon='cursor' open={open}>
              Tooltip params
            </ControlsButton>
          )}
          content={<div>Tooltip Params</div>}
        />
      </ControlsContainer>
      <IconButton icon='download' color='secondary' variant='text' />
    </ControlsPanelContainer>
  );
}

export default React.memo(ControlsBar);
