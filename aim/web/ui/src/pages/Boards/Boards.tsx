import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Link } from '@material-ui/core';
import { IconPlus } from '@tabler/icons-react';

import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import Illustration from 'components/Illustration';
import { Box, Button, Input } from 'components/kit_v2';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { PathEnum } from 'config/enums/routesEnum';

import { BoardsContainer, BoardsCardWrapper } from './Boards.style';
import BoardCard from './components/BoardCard/BoardCard';

function Boards({
  data,
  onBoardDelete,
  isLoading,
  notifyData,
  onNotificationDelete,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <AppBar title={pageTitlesEnum.BOARDS} className='Boards__appBar' />
      <BoardsContainer>
        <Box display='flex' ai='center'>
          <Box flex={1}>
            <Input css={{ width: 380 }} placeholder='Search' />
          </Box>
          <Link
            to={PathEnum.Board.replace(':boardId', 'new')}
            component={RouteLink}
            underline='none'
          >
            <Button
              size='lg'
              leftIcon={<IconPlus color='white' />}
              color='success'
            >
              New
            </Button>
          </Link>
        </Box>
        <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
          <BoardsCardWrapper>
            {data?.length > 0 &&
              data.map((board: any) => (
                <BoardCard
                  key={board.id}
                  onBoardDelete={onBoardDelete}
                  {...board}
                />
              ))}
          </BoardsCardWrapper>
        </BusyLoaderWrapper>
      </BoardsContainer>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </ErrorBoundary>
  );
}

export default Boards;
