import * as React from 'react';
import { Route, useLocation } from 'react-router-dom';

import { IconBrandPython } from '@tabler/icons-react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import {
  Box,
  Breadcrumb,
  ToastProvider,
  Toast,
  Tree,
  Icon,
  Text,
} from 'components/kit_v2';

import { TopBar } from 'config/stitches/foundations/layout';
import { PathEnum } from 'config/enums/routesEnum';

import Board from 'pages/Board/Board';
import useBoardStore from 'pages/Board/BoardStore';

import { AppStructureProps, AppWrapperProps } from './App.d';
import useApp from './useApp';
import { AppContainer, BoardWrapper, BoardLink } from './App.style';

interface Node {
  title: string | React.ReactNode;
  key: string;
  value?: string;
  children?: Node[];
  isLeaf?: boolean;
  icon?: React.ReactNode;
}

const AppStructure: React.FC<any> = ({ boards }: AppStructureProps) => {
  const location = useLocation();

  function makeTreeData(list: string[]): Node[] {
    let tree: Node[] = [];
    let lookup: Record<string, Node> = {};

    // Sort the input list alphabetically
    list.sort();

    // Separate directories and files
    let dirs = list.filter((path) => path.includes('/'));
    let files = list.filter((path) => !path.includes('/'));

    // Prioritize directories, then files
    let sortedList = [...dirs, ...files];

    // Step 1: Create nodes and build a lookup
    for (let i = 0; i < sortedList.length; i++) {
      const isActive = location.pathname === `${PathEnum.App}/${sortedList[i]}`;
      let path = sortedList[i].split('/');
      for (let j = 0; j < path.length; j++) {
        const isLast = j === path.length - 1;
        let part = path.slice(0, j + 1).join('/');
        if (!lookup[part]) {
          let node: Node = {
            title: isLast ? (
              <BoardLink
                isActive={isActive}
                key={path[j]}
                to={`${PathEnum.App}/${sortedList[i]}`}
              >
                <Icon size='md' icon={<IconBrandPython />} />
                <Text css={{ ml: '$4' }}>{path[j]}</Text>
              </BoardLink>
            ) : (
              <Text>{path[j]}</Text>
            ),
            isLeaf: isLast,
            value: path[j],
            key: `${i}-${j}`,
            ...(!isLast && { children: [] }),
          };
          lookup[part] = node;
        }
      }
    }

    // Step 2: Build the tree
    for (let path in lookup) {
      let node = lookup[path];
      if (path.indexOf('/') !== -1) {
        let parentPath = path.substring(0, path.lastIndexOf('/'));
        lookup[parentPath].children?.push(node);
      } else {
        tree.push(node);
      }
    }

    return tree;
  }

  const data: Node[] = makeTreeData(boards.sort());

  return (
    <Box
      width={200}
      css={{
        borderRight: '1px solid $border30',
        backgroundColor: '#fff',
        p: '$3 $4',
      }}
    >
      <Tree defaultExpandAll={true} data={data} />
    </Box>
  );
};

function App(): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading, notifications } = useApp();

  return (
    <ErrorBoundary>
      {isLoading ? null : (
        <Route path={[`${PathEnum.App}/*`, `${PathEnum.App}/*/edit`]} exact>
          {(props: any) => {
            let boardPath = '';
            if (props.match?.params?.[0]) {
              boardPath = props.match.params[0];
            }
            const editMode = props.location.pathname.endsWith('/edit');
            return (
              <AppWrapper
                boardList={data}
                boardPath={encodeURI(boardPath || '')}
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

function AppWrapper({ boardPath, editMode, boardList }: AppWrapperProps) {
  const board = useBoardStore((state) => state.boards?.[boardPath]);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const updateBoard = useBoardStore((state) => state.editBoard);

  React.useEffect(() => {
    if (boardPath && !board) {
      const path = editMode ? boardPath?.replace('/edit', '') : boardPath;
      fetchBoard(path);
    }
  }, [boardPath, board]);

  const saveBoard = (board: any) => {
    updateBoard(boardPath, {
      ...board,
    });
  };

  return (
    <AppContainer>
      <TopBar id='app-top-bar'>
        <Box flex='1 100%'>
          <Breadcrumb
            items={[
              {
                name: 'App',
                path: '/app',
              },
              { name: boardPath, path: `/app/${boardPath}` },
            ]}
          />
        </Box>
      </TopBar>
      <Box display='flex' height='calc(100% - 28px)'>
        <AppStructure boards={boardList} />
        <BoardWrapper>
          {board && (
            <Board
              key={board.path}
              data={board}
              previewMode={true}
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
