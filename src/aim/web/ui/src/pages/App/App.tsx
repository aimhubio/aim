import * as React from 'react';
import { Route } from 'react-router-dom';

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

import useApp from './useApp';
import {
  AppContainer,
  BoardContainer,
  BoardWrapper,
  BoardLink,
} from './App.style';

interface BoardsListProps {
  boards: any[];
}

const BoardsList: React.FC<BoardsListProps> = ({ boards }) => {
  return (
    <div>
      {boards.map((board: any) => (
        <BoardLink key={board.id} to={`${PathEnum.App}/${board.id}`}>
          <ListItem>{board.name}</ListItem>
        </BoardLink>
      ))}
    </div>
  );
};

interface BoardRendererProps {
  board: any;
  data: any;
}

const BoardRenderer: React.FC<BoardRendererProps> = ({ board, data }) => {
  const code = data.files_contents[board.path];
  const lines = code.split('\n');
  const embedPattern = /^BoardEmbed\("(.*?)"\)$/;
  const linkPattern = /^BoardLink\("(.*?)"\)$/;
  const replacedLines = lines.map((line: string) => {
    // Replace embeds
    const embedMatch = line.match(embedPattern);
    if (embedMatch) {
      const filePath = embedMatch[1].replace(/\./g, '/') + '.py';
      const relPath = filePath
        .replace(new RegExp(`^${data.app_dir_name}/?`), '')
        .trim();
      try {
        return data.files_contents[relPath];
      } catch (error) {
        return line;
      }
    }
    // Replace links
    const linkMatch = line.match(linkPattern);
    if (linkMatch) {
      const filePath = linkMatch[1].replace(/\./g, '/') + '.py';
      const relPath = filePath
        .replace(new RegExp(`^${data.app_dir_name}/?`), '')
        .trim();
      return `BoardLink("${relPath}")`;
      // return 'pass';
    }
    return line;
  });
  const fullCode = replacedLines.join('\n');

  return (
    <BoardWrapper>
      <Board
        key={board.path}
        data={{
          code: fullCode,
        }}
        editMode={false}
        previewMode
      />
    </BoardWrapper>
  );
};

function App(): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading } = useApp();

  return (
    <ErrorBoundary>
      <TopBar>
        <Text weight='$3'>APP</Text>
      </TopBar>
      {isLoading ? (
        <>
          <p>Loading...</p>
        </>
      ) : (
        <AppContainer>
          <BoardWrapper>
            <Route path={`${PathEnum.App}/:boardId`}>
              {(props) => {
                const boardId = props.match?.params?.boardId;
                if (!boardId) {
                  return <div />;
                }
                const board = data.find((b: any) => b.id === boardId);
                return (
                  <Board
                    key={board.id}
                    data={{
                      code: board.code,
                    }}
                    editMode={false}
                    previewMode
                  />
                );
              }}
            </Route>
          </BoardWrapper>
          <BoardsList boards={data} />
        </AppContainer>
      )}
    </ErrorBoundary>
  );
}

export default App;
