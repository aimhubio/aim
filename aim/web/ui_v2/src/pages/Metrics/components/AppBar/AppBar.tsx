import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import BookmarkForm from '../BookmarkForm/BookmarkForm';
import { IAppBarProps } from 'types/pages/metrics/components/AppBar/AppBar';

function AppBar({
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
}: IAppBarProps): React.FunctionComponentElement<React.ReactNode> {
  const [popover, setPopover] = React.useState<string>('');
  const route = useRouteMatch<any>();

  function handlePopoverChange(value: string) {
    setPopover(value);
  }

  return (
    <Grid container justifyContent='space-between' alignItems='center'>
      <Grid item>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='breadcrumb'
        >
          <Link color='inherit' href='/'>
            Aim
          </Link>
          <Link color='inherit' href='/'>
            Apps
          </Link>
          <Typography color='textPrimary'>Metrics</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item>
        <Grid container spacing={1}>
          <Grid item>
            <Button
              onClick={() => handlePopoverChange('save')}
              size='small'
              variant='outlined'
              color='primary'
            >
              S
            </Button>
            <BookmarkForm
              onBookmarkCreate={onBookmarkCreate}
              onClose={() => handlePopoverChange('')}
              open={popover === 'save'}
            />
          </Grid>
          <Grid item>
            <Button
              onClick={() => handlePopoverChange('update')}
              size='small'
              disabled={!route.params.appId}
              variant='outlined'
              color='primary'
            >
              U
            </Button>
            <Dialog
              open={popover === 'update'}
              onClose={() => handlePopoverChange('')}
              aria-labelledby='form-dialog-title'
            >
              <DialogTitle id='form-dialog-title'>Update Bookmark</DialogTitle>
              <DialogContent>
                <Typography>Do you want to update bookmark?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handlePopoverChange('')} color='primary'>
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
          </Grid>
          <Grid item>
            <Button size='small' variant='outlined' color='primary'>
              <ChevronLeft />
            </Button>
          </Grid>
          <Grid item>
            <Button size='small' variant='outlined' color='primary'>
              <ChevronRight />
            </Button>
          </Grid>
          <Grid item>
            <Button size='small' variant='outlined' color='primary'>
              M
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(AppBar);
