import React from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumbs, Button, Grid, Link, Typography } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import BookmarkForm from '../BookmarkForm/BookmarkForm';
import { IAppBarProps } from 'types/pages/metrics/components/AppBar/AppBar';

function AppBar({
  onBookmarkCreate,
  onBookmarkUpdate,
}: IAppBarProps): React.FunctionComponentElement<React.ReactNode> {
  const [openBookmark, setOpenBookmark] = React.useState<boolean>(false);
  const history = useHistory();
  function handleOpenChange() {
    setOpenBookmark(!openBookmark);
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
          <Link color='inherit' href='/getting-started/installation/'>
            Apps
          </Link>
          <Typography color='textPrimary'>Metrics</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item>
        <Grid container spacing={1}>
          <Grid item>
            <Button
              onClick={handleOpenChange}
              size='small'
              variant='outlined'
              color='primary'
            >
              S
            </Button>
            <BookmarkForm
              onBookmarkCreate={onBookmarkCreate}
              onClose={handleOpenChange}
              open={openBookmark}
            />
          </Grid>
          <Grid item>
            <Button
              // onClick={() => onBookmarkUpdate()}
              size='small'
              variant='outlined'
              color='primary'
            >
              U
            </Button>
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
