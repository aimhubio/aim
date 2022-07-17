import React from 'react';

import { MenuItem } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import './HideRowsPopover.scss';

function HideRowsPopover({
  toggleRowsVisibility,
  visualizationElementType,
  data,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const hiddenRowsCount = React.useMemo(
    () => data.filter((row: any) => row.isHidden).length,
    [data],
  );

  return (
    <ErrorBoundary>
      <ControlPopover
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        anchor={({ onAnchorClick, opened }) => (
          <Button
            variant='text'
            color='secondary'
            size='small'
            onClick={onAnchorClick}
            className='HideRowsPopover__trigger'
          >
            <Icon name='eye-outline-hide' />
            <Text size={14} tint={100}>
              {hiddenRowsCount > 0
                ? `${hiddenRowsCount} ${visualizationElementType} are hidden`
                : `Hide ${visualizationElementType}`}
            </Text>
          </Button>
        )}
        component={
          <div className='HideRowsPopover'>
            <MenuItem
              className='HideRowsPopover__item'
              onClick={() => toggleRowsVisibility([])}
            >
              {`Visualize All ${visualizationElementType}`}
            </MenuItem>
            <MenuItem
              className='HideRowsPopover__item'
              onClick={() => toggleRowsVisibility(['all'])}
            >
              {`Hide All ${visualizationElementType}`}
            </MenuItem>
          </div>
        }
      />
    </ErrorBoundary>
  );
}

export default React.memo(HideRowsPopover);
