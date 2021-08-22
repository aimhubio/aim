import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import BookmarkForm from '../BookmarkForm/BookmarkForm';
import { IAppBarProps } from 'types/pages/metrics/components/AppBar/AppBar';

import './AppBar.scss';
import GroupingPopover from 'components/GroupingPopover/GroupingPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
function AppBar({
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
}: IAppBarProps): React.FunctionComponentElement<React.ReactNode> {
  const [popover, setPopover] = React.useState<string>('');
  const route = useRouteMatch<any>();

  function handleBookmarkClick() {
    setPopover(route.params.appId ? 'update' : 'create');
  }

  function handleClosePopover() {
    setPopover('');
  }

  return (
    <div className='AppBar__container'>
      <div onClick={handleBookmarkClick} className='AppBar__item__bookmark'>
        <span className='AppBar__item__bookmark__span'>Bookmark</span>
        <span>
          <i className='icon-bookmark' />
        </span>
      </div>
      <div className='AppBar__menu'>
        <span>
          <i className='icon-menu' />
        </span>
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
    </div>
  );
}

export default React.memo(AppBar);
