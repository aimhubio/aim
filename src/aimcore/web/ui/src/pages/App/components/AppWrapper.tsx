import * as React from 'react';

import { IconPencil } from '@tabler/icons-react';

import { Box, Breadcrumb, Text, Link, Button } from 'components/kit_v2';

import { TopBar } from 'config/stitches/foundations/layout';
import { PathEnum } from 'config/enums/routesEnum';

import Board from 'pages/Board/Board';
import useBoardStore from 'pages/Board/BoardStore';

import { AppWrapperProps } from '../App.d';
import { AppContainer, BoardWrapper } from '../App.style';

import AppSidebar from './AppSidebar';

function AppWrapper({
  boardPath,
  editMode,
  boardList,
  stateStr,
}: AppWrapperProps) {
  const path = boardPath?.replace('/edit', '');
  const board = useBoardStore((state) => state.boards?.[path]);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  // const updateBoard = useBoardStore((state) => state.editBoard);

  React.useEffect(() => {
    if (boardPath && !board) {
      fetchBoard(path);
    }
  }, [boardPath]);

  // const saveBoard = (board: any) => {
  //   updateBoard(boardPath, {
  //     ...board,
  //   });
  // };

  const breadcrumbItems = React.useMemo(() => {
    const splitPath = path.split('/');
    let items = [
      {
        name: 'App',
        path: '/app',
      },
      {
        name: splitPath.map((path, index) => {
          const isLast = index === splitPath.length - 1;
          return (
            <Text
              color={editMode ? '$textPrimary50' : '$textPrimary'}
              key={index}
              size='$3'
              css={{ mx: '$2' }}
            >
              {isLast ? path.slice(0, path.length - 3) : `${path} /`}
            </Text>
          );
        }),
        path: `/app/${path}`,
      },
    ];
    if (editMode) {
      items.push({
        name: 'Edit',
        path: `/app/${path}/edit`,
      });
    }

    return items;
  }, [editMode, path]);

  let externalPackageNameLastIndex = path.indexOf(':');

  let externalPackage =
    externalPackageNameLastIndex === -1
      ? null
      : path.slice(0, externalPackageNameLastIndex);

  return (
    <AppContainer>
      <TopBar id='app-top-bar'>
        <Box flex='1 100%'>
          <Breadcrumb items={breadcrumbItems} />
        </Box>
        {board && !editMode && (
          <Link
            css={{ display: 'flex' }}
            to={`${PathEnum.App}/${boardPath}/edit${
              stateStr ? '?state=' + encodeURIComponent(stateStr) : ''
            }`}
            underline={false}
          >
            <Button variant='outlined' size='xs' rightIcon={<IconPencil />}>
              Playground
            </Button>
          </Link>
        )}
      </TopBar>
      <Box display='flex' height='calc(100% - 28px)'>
        <AppSidebar boards={boardList} editMode={editMode} />
        <BoardWrapper>
          {board && (
            <Board
              key={board.path + editMode}
              data={board}
              editMode={editMode}
              stateStr={stateStr}
              externalPackage={externalPackage}
              // saveBoard={saveBoard}
            />
          )}
        </BoardWrapper>
      </Box>
    </AppContainer>
  );
}

export default AppWrapper;
