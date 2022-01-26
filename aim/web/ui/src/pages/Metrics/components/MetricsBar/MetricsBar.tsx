import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from '@material-ui/core';

import BookmarkForm from 'components/BookmarkForm/BookmarkForm';
import AppBar from 'components/AppBar/AppBar';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import LiveUpdateSettings from 'components/LiveUpdateSettings/LiveUpdateSettings';
import { Button, Icon, Text } from 'components/kit';

import { IMetricsBarProps } from 'types/pages/metrics/components/MetricsBar/MetricsBar';

import './MetricsBar.scss';

function MetricsBar({
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
  liveUpdateConfig,
  onLiveUpdateConfigChange,
  title,
}: IMetricsBarProps): React.FunctionComponentElement<React.ReactNode> {
  const [popover, setPopover] = React.useState<string>('');
  const route = useRouteMatch<any>();

  function handleBookmarkClick(value: string): void {
    setPopover(value);
  }

  function handleClosePopover(): void {
    setPopover('');
  }

  function handleBookmarkUpdate(): void {
    onBookmarkUpdate(route.params.appId);
    handleClosePopover();
  }

  return (
    <AppBar title={title}>
      <LiveUpdateSettings
        {...liveUpdateConfig}
        onLiveUpdateConfigChange={onLiveUpdateConfigChange}
      />
      {route.params.appId ? (
        <ControlPopover
          title='Bookmark'
          anchor={({ onAnchorClick }) => (
            <Button color='secondary' size='small' onClick={onAnchorClick}>
              <Text size={14} className='MetricsBar__item__bookmark__Text'>
                Bookmark
              </Text>
              <Icon
                name='bookmarks'
                className='MetricsBar__item__bookmark__Icon'
              />
            </Button>
          )}
          component={
            <div className='MetricsBar__popover'>
              <MenuItem onClick={() => handleBookmarkClick('create')}>
                Create Bookmark
              </MenuItem>
              <MenuItem onClick={() => handleBookmarkClick('update')}>
                Update Bookmark
              </MenuItem>
            </div>
          }
        />
      ) : (
        <Button
          color='secondary'
          className='MetricsBar__item__bookmark'
          size='small'
          onClick={() => handleBookmarkClick('create')}
        >
          <Text size={14} className='MetricsBar__item__bookmark__Text'>
            Bookmark
          </Text>
          <Icon
            fontSize={14}
            name='bookmarks'
            className='MetricsBar__item__bookmark__Icon'
          />
        </Button>
      )}
      <div className='MetricsBar__menu'>
        <ControlPopover
          title='Menu'
          anchor={({ onAnchorClick }) => (
            <Button
              withOnlyIcon
              color='secondary'
              size='small'
              onClick={onAnchorClick}
            >
              <Icon
                fontSize={16}
                name='menu'
                className='MetricsBar__item__bookmark__Icon'
              />
            </Button>
          )}
          component={
            <div className='MetricsBar__popover'>
              <MenuItem onClick={onResetConfigData}>
                Reset Controls to System Defaults
              </MenuItem>
            </div>
          }
        />
      </div>
      <BookmarkForm
        onBookmarkCreate={onBookmarkCreate}
        onClose={handleClosePopover}
        open={popover === 'create'}
      />
      <Dialog
        open={popover === 'update'}
        onClose={handleClosePopover}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>Update Bookmark</DialogTitle>
        <DialogContent>
          <Text size={16} component='p' weight={500}>
            Do you want to update bookmark?
          </Text>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopover} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleBookmarkUpdate} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

export default React.memo(MetricsBar);
