import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

  function handleBookmarkClick() {
    setPopover(route.params.appId ? 'update' : 'create');
  }

  function handleClosePopover() {
    setPopover('');
  }

  return (
    <AppBar title='Metrics'>
      <div onClick={handleBookmarkClick} className='MetricsBar__item__bookmark'>
        <span className='MetricsBar__item__bookmark__span'>Bookmark</span>
        <span>
          <i className='icon-bookmark' />
        </span>
      </div>
      <div className='MetricsBar__menu'>
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
    </AppBar>
  );
}

export default React.memo(MetricsBar);
