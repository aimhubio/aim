import React from 'react';

import { IconCaretDown, IconCaretUp, IconCircleX } from '@tabler/icons-react';

import ResizeElement, {
  ResizableElement,
  ResizableSideEnum,
} from 'components/ResizeElement';
import { Box, IconButton, Text, Tooltip } from 'components/kit_v2';

import { getItem } from 'utils/storage';

import { BoardConsoleElement } from '../Board.style';
import useBoardStore from '../BoardSore';

const BOARD_CONSOLE_SIZES = {
  MIN_HEIGHT: 24,
  INITIAL_SIZES: {
    height: 150,
    maxHeight: 250,
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
      vizContainer.current.style.marginBottom = `${resizeElement.current?.offsetHeight}px`;
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
    const sizes = JSON.parse(getItem('board-ResizeElement')!);
    setConsoleOpen(height > BOARD_CONSOLE_SIZES.MIN_HEIGHT);
    vizContainer.current.style.marginBottom = `${
      sizes?.height || `${BOARD_CONSOLE_SIZES.INITIAL_SIZES.height}px`
    }`;
  }

  function handleOpenConsole() {
    const height = resizeElementRef.current?.offsetHeight;
    if (height > BOARD_CONSOLE_SIZES.MIN_HEIGHT) {
      resizeElementRef.current.style.height = `${BOARD_CONSOLE_SIZES.MIN_HEIGHT}px`;
      vizContainer.current.style.marginBottom = `${BOARD_CONSOLE_SIZES.MIN_HEIGHT}px`;
    } else {
      resizeElementRef.current.style.height = `${BOARD_CONSOLE_SIZES.INITIAL_SIZES.maxHeight}px`;
      vizContainer.current.style.marginBottom = `${BOARD_CONSOLE_SIZES.INITIAL_SIZES.maxHeight}px`;
    }
  }

  return (
    <ResizeElement
      id='board-ResizeElement'
      side={ResizableSideEnum.TOP}
      useLocalStorage={true}
      onMount={handleResizeElementMount}
      initialSizes={{
        ...BOARD_CONSOLE_SIZES.INITIAL_SIZES,
        width: vizContainer.current?.offsetWidth,
      }}
      onResizeEnd={onResizeEnd}
      onResizeStart={onResizeStart}
    >
      <ResizableElement>
        <Box p='$2 $5' display='flex' ai='center' jc='space-between'>
          <Text size='$3' mono>
            Console
          </Text>
          <BoardConsoleOpener
            consoleElement={consoleElementRef}
            onClick={handleOpenConsole}
          />
        </Box>
        <BoardConsoleElement ref={consoleElementRef} id='console' />
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
          icon={isConsoleOpened ? <IconCaretDown /> : <IconCaretUp />}
        />
      </Tooltip>
    </Box>
  );
}
export default React.memo(BoardConsole);
