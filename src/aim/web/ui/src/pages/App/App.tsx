import * as React from 'react';
import { Route } from 'react-router-dom';

import { IconPencil } from '@tabler/icons-react';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import {
  Box,
  Button,
  Input,
  Link,
  Icon,
  ListItem,
  Text,
} from 'components/kit_v2';

import { TopBar } from 'config/stitches/foundations/layout';
import { PathEnum } from 'config/enums/routesEnum';

import Board from 'pages/Board/Board';

import boardAppModel from 'services/models/board/boardAppModel';

import useApp from './useApp';
import { AppContainer, BoardWrapper, BoardLink } from './App.style';

const BoardsList: React.FC<any> = ({ boards, editMode }) => {
  return (
    <Box
      width={200}
      css={{ borderRight: '1px solid $border30', backgroundColor: '#fff' }}
    >
      {boards.map((board: any) => (
        <BoardLink
          key={board.id}
          to={`${PathEnum.App}/${editMode ? 'edit' : 'view'}/${board.id}`}
        >
          <ListItem>{board.name}</ListItem>
        </BoardLink>
      ))}
    </Box>
  );
};

function App(): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading } = useApp();

  const saveBoard = React.useCallback(
    async (board: any) => {
      await boardAppModel.updateBoard(board.id, {
        ...board,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ErrorBoundary>
      {isLoading ? null : (
        <Route
          path={[
            `${PathEnum.App}/view/:boardId`,
            `${PathEnum.App}/edit/:boardId`,
          ]}
          exact
        >
          {(props) => {
            const boardId = props.match?.params?.boardId;
            const board = data.find((b: any) => b.id === boardId);
            const editMode = props.match?.path.includes(`${PathEnum.App}/edit`);
            return (
              <AppContainer>
                <TopBar id='app-top-bar'>
                  <Box flex='1 100%'>
                    <Text weight='$3'>APP</Text>
                  </Box>
                  {board && !editMode && (
                    <Link
                      css={{ display: 'flex' }}
                      to={`${PathEnum.App}/edit/${boardId}`}
                      underline={false}
                    >
                      <Button
                        variant='outlined'
                        size='xs'
                        rightIcon={<IconPencil />}
                      >
                        Edit
                      </Button>
                    </Link>
                  )}
                </TopBar>
                <Box display='flex'>
                  <BoardsList boards={data} editMode={editMode} />
                  <BoardWrapper>
                    {board && (
                      <Board
                        key={board.id + editMode}
                        data={board}
                        editMode={editMode}
                        saveBoard={saveBoard}
                      />
                    )}
                  </BoardWrapper>
                </Box>
              </AppContainer>
            );
          }}
        </Route>
      )}
    </ErrorBoundary>
  );
}

export default App;
