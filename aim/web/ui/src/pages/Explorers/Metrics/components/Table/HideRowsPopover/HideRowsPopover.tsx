import React from 'react';
import _ from 'lodash-es';

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
  const hiddenRowsCount = React.useMemo(() => {
    if (_.isArray(data)) {
      return data.filter((row: any) => row.isHidden).length;
    }
    return Object.values(data).reduce((acc: number, item: any) => {
      acc += item.items.filter((row: any) => row.isHidden).length;
      return acc;
    }, 0);
  }, [data]);

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
            className={`HideRowsPopover__trigger ${
              opened || hiddenRowsCount > 0 ? 'opened' : ''
            }`}
          >
            <Icon name='eye-outline-hide' />
            <Text size={14} tint={100}>
              {hiddenRowsCount > 0
                ? `${hiddenRowsCount} ${visualizationElementType}${
                    hiddenRowsCount > 1 ? 's are' : ' is'
                  } hidden`
                : `Hide ${visualizationElementType}s`}
            </Text>
          </Button>
        )}
        component={
          <div className='HideRowsPopover'>
            <MenuItem
              className='HideRowsPopover__item'
              onClick={() => toggleRowsVisibility([])}
            >
              {`Visualize All ${visualizationElementType}s`}
            </MenuItem>
            <MenuItem
              className='HideRowsPopover__item'
              onClick={() => toggleRowsVisibility(['all'])}
            >
              {`Hide All ${visualizationElementType}s`}
            </MenuItem>
          </div>
        }
      />
    </ErrorBoundary>
  );
}

export default React.memo(HideRowsPopover);
