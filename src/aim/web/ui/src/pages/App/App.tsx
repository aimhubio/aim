import * as React from 'react';
import { Route } from 'react-router-dom';

import { IconPencil } from '@tabler/icons-react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import {
  Box,
  Button,
  Link,
  ListItem,
  Breadcrumb,
  ToastProvider,
  Toast,
} from 'components/kit_v2';

import { TopBar } from 'config/stitches/foundations/layout';
import { PathEnum } from 'config/enums/routesEnum';

import Board from 'pages/Board/Board';
import useBoardStore from 'pages/Board/BoardStore';

import { AppStructureProps, AppWrapperProps } from './App.d';
import useApp from './useApp';
import { AppContainer, BoardWrapper, BoardLink } from './App.style';

const AppStructure: React.FC<any> = ({
  boards,
  editMode,
}: AppStructureProps) => {
  return (
    <Box
      width={200}
      css={{
        borderRight: '1px solid $border30',
        backgroundColor: '#fff',
        p: '$3 $4',
      }}
    >
      {boards.map((board) => (
        <BoardLink
          key={board.board_id}
          to={`${PathEnum.App}/${board.board_id}/${editMode ? 'edit' : ''}`}
        >
          <ListItem>{board.name}</ListItem>
        </BoardLink>
      ))}
    </Box>
  );
};

function App(): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading, notifications } = useApp();

  return (
    <ErrorBoundary>
      {isLoading ? null : (
        <Route
          path={[`${PathEnum.App}/:boardId`, `${PathEnum.App}/:boardId/edit`]}
          exact
        >
          {(props) => {
            const boardId = props.match?.params?.boardId;
            const editMode = props.match?.path.includes(
              `${PathEnum.App}/:boardId/edit`,
            );
            return (
              <AppWrapper
                boardList={data}
                boardId={boardId!}
                editMode={editMode!}
              />
            );
          }}
        </Route>
      )}
      <ToastProvider
        placement='bottomRight'
        swipeDirection='right'
        duration={5000}
      >
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            onOpenChange={(open) => {
              if (!open && notification.onDelete) {
                notification.onDelete(notification.id)!;
              }
            }}
            {...notification}
          />
        ))}
      </ToastProvider>
    </ErrorBoundary>
  );
}

function AppWrapper({ boardId, editMode, boardList }: AppWrapperProps) {
  const board = useBoardStore((state) => state.board);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const updateBoard = useBoardStore((state) => state.editBoard);

  React.useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [boardId]);

  const saveBoard = (board: any) => {
    updateBoard(boardId, {
      ...board,
    });
  };

  return (
    <AppContainer>
      <TopBar id='app-top-bar'>
        <Box flex='1 100%'>
          <Breadcrumb
            customRouteValues={{
              [`/app/${boardId}`]: board?.name || ' ',
            }}
          />
        </Box>
        {board && !editMode && (
          <Link
            css={{ display: 'flex' }}
            to={`${PathEnum.App}/${boardId}/edit`}
            underline={false}
          >
            <Button variant='outlined' size='xs' rightIcon={<IconPencil />}>
              Edit
            </Button>
          </Link>
        )}
      </TopBar>
      <Box display='flex' height='calc(100% - 28px)'>
        <AppStructure boards={boardList} editMode={editMode} />
        <BoardWrapper>
          {board && (
            <Board
              key={board.board_id + editMode}
              data={board}
              editMode={editMode}
              saveBoard={saveBoard}
              isLading={false}
            />
          )}
        </BoardWrapper>
      </Box>
    </AppContainer>
  );
}

export default App;
