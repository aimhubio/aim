import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Link } from '@material-ui/core';

import { Button, Text } from 'components/kit';
import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import Illustration from 'components/Illustration';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { PathEnum } from 'config/enums/routesEnum';

import BoardDelete from './BoardDelete';

import './Boards.scss';

function Boards({
  data,
  onBoardDelete,
  isLoading,
  notifyData,
  onNotificationDelete,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <section className='Boards'>
        <AppBar title={pageTitlesEnum.BOARDS} className='Boards__appBar' />
        <div className='Boards__list'>
          <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
            <div
              key='new'
              className='Boards__list__item Boards__list__item--new'
            >
              <div className='Boards__list__item__header'>
                <Text size={16} weight={700}>
                  New board
                </Text>
                <Link
                  to={PathEnum.Board.replace(':boardId', 'new')}
                  component={RouteLink}
                  underline='none'
                >
                  <Button variant='outlined' size='small'>
                    Create
                  </Button>
                </Link>
              </div>
              <div className='Boards__list__item__sub'>
                <Text>Create custom board</Text>
              </div>
              <div className='Boards__list__item__preview'>
                <Illustration />
              </div>
            </div>
            {data?.length > 0 &&
              data.map((board: any) => (
                <div key={board.id} className='Boards__list__item'>
                  <div className='Boards__list__item__header'>
                    <Text size={16} weight={700}>
                      {board.name}
                    </Text>
                    <div>
                      <Link
                        to={PathEnum.Board.replace(':boardId', board.id)}
                        component={RouteLink}
                        underline='none'
                      >
                        <Button variant='outlined' size='small'>
                          View
                        </Button>
                      </Link>
                      <BoardDelete
                        board_id={board.id}
                        onBoardDelete={onBoardDelete}
                      />
                    </div>
                  </div>
                  <div className='Boards__list__item__sub'>
                    <Text>{board.description}</Text>
                  </div>
                  <div className='Boards__list__item__preview'>
                    <CodeBlock code={board.code} hideCopyIcon />
                  </div>
                </div>
              ))}
          </BusyLoaderWrapper>
        </div>
      </section>
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
