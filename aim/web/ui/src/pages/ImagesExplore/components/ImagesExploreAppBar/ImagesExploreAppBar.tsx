import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Typography,
} from '@material-ui/core';

import BookmarkForm from 'components/BookmarkForm/BookmarkForm';
import AppBar from 'components/AppBar/AppBar';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon, Button } from 'components/kit';

import './ImagesExploreAppBar.scss';

function ImagesExploreAppBar({
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
  title,
}: any): React.FunctionComponentElement<React.ReactNode> {
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
      {route.params.appId ? (
        <ControlPopover
          title='Bookmark'
          anchor={({ onAnchorClick }) => (
            <Button
              color='secondary'
              className='ImagesExploreAppBar__item__bookmark'
              size='small'
              onClick={onAnchorClick}
            >
              <span className='ImagesExploreAppBar__item__bookmark__span'>
                Bookmark
              </span>
              <Icon name='bookmarks' />
            </Button>
          )}
          component={
            <div className='ImagesExploreAppBar__popover'>
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
          className='ImagesExploreAppBar__item__bookmark'
          size='small'
          onClick={() => handleBookmarkClick('create')}
        >
          <span className='ImagesExploreAppBar__item__bookmark__span'>
            Bookmark
          </span>
          <Icon name='bookmarks' />
        </Button>
      )}

      <div className='ImagesExploreAppBar__menu'>
        <ControlPopover
          title='Menu'
          anchor={({ onAnchorClick }) => (
            <Button
              withOnlyIcon
              color='secondary'
              size='small'
              onClick={onAnchorClick}
            >
              <Icon name='menu' />
            </Button>
          )}
          component={
            <div className='ImagesExploreAppBar__popover'>
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
          <Button onClick={handleBookmarkUpdate} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

export default React.memo(ImagesExploreAppBar);
