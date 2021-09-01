import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core';
import BookmarkForm from '../BookmarkForm/BookmarkForm';
import AppBar from 'components/AppBar/AppBar';

import GroupingPopover from 'components/GroupingPopover/GroupingPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { IMetricsBarProps } from 'types/pages/metrics/components/MetricsBar/MetricsBar';

import './MetricsBar.scss';

function MetricsBar({
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
}: IMetricsBarProps): React.FunctionComponentElement<React.ReactNode> {
  const [popover, setPopover] = React.useState<string>('');
  const route = useRouteMatch<any>();

  function handleBookmarkClick(value: string): void {
    setPopover(value);
  }

  function handleClosePopover(): void {
    setPopover('');
  }

  return (
    <AppBar title='Explore'>
      {route.params.appId ? (
        <ControlPopover
          title='Bookmark'
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='MetricsBar__item__bookmark'>
              <span className='MetricsBar__item__bookmark__span'>Bookmark</span>
              <span>
                <i className='icon-bookmark' />
              </span>
            </div>
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
        <div
          onClick={() => handleBookmarkClick('create')}
          className='MetricsBar__item__bookmark'
        >
          <span className='MetricsBar__item__bookmark__span'>Bookmark</span>
          <span>
            <i className='icon-bookmark' />
          </span>
        </div>
      )}

      <div className='MetricsBar__menu'>
        <ControlPopover
          title='Menu'
          anchor={({ onAnchorClick }) => (
            <span onClick={onAnchorClick}>
              <i className='icon-menu' />
            </span>
          )}
          component={
            <div className='MetricsBar__popover'>
              <MenuItem onClick={onResetConfigData}>
                Reset Controls to System Defaults
              </MenuItem>
              <a
                href='https://github.com/aimhubio/aim#searching-experiments'
                target='_blank'
                rel='noreferrer'
              >
                <MenuItem>Searching Experiments (docs)</MenuItem>
              </a>
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
          <Typography>Do you want to update bookmark?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopover} color='primary'>
            Cancel
          </Button>
          <Button
            onClick={() => onBookmarkUpdate(route.params.appId)}
            color='primary'
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

export default React.memo(MetricsBar);
