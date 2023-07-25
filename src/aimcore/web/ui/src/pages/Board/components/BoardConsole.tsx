import React from 'react';

import { IconCircleX } from '@tabler/icons-react';

import { ReactComponent as ArrowDown } from 'assets/icons/dropdown-arrow-down.svg';
import { ReactComponent as ArrowUp } from 'assets/icons/dropdown-arrow-up.svg';

import ResizeElement, {
  ResizableElement,
  ResizableSideEnum,
} from 'components/ResizeElement';
import { Box, IconButton, Text, Tooltip } from 'components/kit_v2';

import useBoardStore from 'pages/Board/BoardStore';

import {
  BoardConsoleWrapper,
  BoardConsolePanel,
  BoardConsoleElement,
} from '../Board.style';

const BOARD_CONSOLE_SIZES = {
  MIN_HEIGHT: 24,
  INITIAL_SIZES: {
    height: 150,
    maxHeight: 400,
    maxWidth: 1920,
  },
};
function BoardConsole({
  vizContainer,
  boxContainer,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const setConsoleOpen = useBoardStore((state) => state.setConsoleOpen);
  const resizeElementRef = React.useRef<any>(null);
  const consoleElementRef = React.useRef<any>(null);

  const onResizeEnd = React.useCallback(
    (resizeElement) => {
      boxContainer.current.classList.remove('ScrollBar__hidden');
      setConsoleOpen(
        resizeElement.current?.offsetHeight > BOARD_CONSOLE_SIZES.MIN_HEIGHT,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boxContainer, vizContainer],
  );

  const onResizeStart = React.useCallback(() => {
    boxContainer.current.classList.add('ScrollBar__hidden');
  }, [boxContainer]);

  function handleResizeElementMount(resizeElement: any) {
    resizeElementRef.current = resizeElement.current;
    const height = resizeElementRef.current?.offsetHeight;
    setConsoleOpen(height > BOARD_CONSOLE_SIZES.MIN_HEIGHT);
  }

  function handleOpenConsole() {
    const height = resizeElementRef.current?.offsetHeight;
    if (height > BOARD_CONSOLE_SIZES.MIN_HEIGHT) {
      resizeElementRef.current.style.height = `${BOARD_CONSOLE_SIZES.MIN_HEIGHT}px`;
    } else {
      resizeElementRef.current.style.height = `${BOARD_CONSOLE_SIZES.INITIAL_SIZES.maxHeight}px`;
    }
  }

  return (
    <ResizeElement
      id='board-ResizeElement'
      side={ResizableSideEnum.TOP}
      useLocalStorage={true}
      onMount={handleResizeElementMount}
      initialSizes={BOARD_CONSOLE_SIZES.INITIAL_SIZES}
      onResizeEnd={onResizeEnd}
      onResizeStart={onResizeStart}
    >
      <ResizableElement>
        <BoardConsoleWrapper>
          <BoardConsolePanel>
            <Text size='$3' mono>
              Console
            </Text>
            <BoardConsoleOpener
              consoleElement={consoleElementRef}
              onClick={handleOpenConsole}
            />
          </BoardConsolePanel>
          <BoardConsoleElement ref={consoleElementRef} id='console' />
        </BoardConsoleWrapper>
      </ResizableElement>
    </ResizeElement>
  );
}

function BoardConsoleOpener({ onClick, consoleElement }: any) {
  const isConsoleOpened = useBoardStore((state) => state.consoleOpen);
  const setConsoleOpen = useBoardStore((state) => state.setConsoleOpen);
  function handleClick() {
    setConsoleOpen(!isConsoleOpened);
    onClick();
  }

  function handleClearConsole() {
    consoleElement.current.innerHTML = '';
  }
  return (
    <Box display='flex' ai='center'>
      <Tooltip content='Clear console'>
        <IconButton
          variant='static'
          color='secondary'
          size='xs'
          onClick={handleClearConsole}
          icon={<IconCircleX />}
          css={{ mr: '$3' }}
        />
      </Tooltip>
      <Tooltip content={`${isConsoleOpened ? 'Close' : 'Open'} console`}>
        <IconButton
          variant='static'
          color='secondary'
          size='xs'
          onClick={handleClick}
          icon={isConsoleOpened ? <ArrowDown /> : <ArrowUp />}
        />
      </Tooltip>
    </Box>
  );
}
export default React.memo(BoardConsole);
