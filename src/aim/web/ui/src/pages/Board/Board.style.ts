import SplitPane, { SplitPaneItem } from 'components/SplitPane';
import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';

const BoardVisualizerContainer = styled(Box, {
  $$topDistance: '28px',
  height: 'calc(100vh - $$topDistance)',
  width: '100%',
  maxWidth: '100%',
});

const BoardVisualizerPane = styled(SplitPane, {
  width: '100%',
  maxWidth: '100%',
  height: '100%',
  display: 'flex',
  position: 'relative',
  '.gutter-horizontal': {
    bs: 'inset -1px 0 0 0 $colors$border30 !important',
  },
});

const BoardVisualizerEditorPane = styled(SplitPaneItem, {
  width: '100%',
  maxWidth: '100%',
  height: '100%',
  display: 'flex',
  fd: 'column',
  position: 'relative',
});

const BoardVisualizerComponentsPane = styled(SplitPaneItem, {
  position: 'relative',
  flex: 1,
  display: 'flex',
  fd: 'column',
  '.ResizeElement': {
    position: 'absolute',
    bottom: 0,
    bc: '#fff',
    minHeight: '100px',
    width: '100%',
  },
  '.ResizeElement__gutter__top': {
    bs: 'inset 0 1px 0 0 $colors$border30',
  },
  variants: {
    loading: {
      true: {
        ai: 'center',
        jc: 'center',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
    processing: {
      true: {
        '& > *:not(.BoardVisualizer__main__components__spinner)': {
          filter: 'blur(5px)',
        },
      },
    },
  },
});

const BoardConsole = styled('pre', {
  fontMono: 14,
  p: '$5',
  overflow: 'auto',
  height: '100%',
  borderTop: '1px solid $border30',
});

const BoardComponentsViz = styled('div', {
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  flex: 1,
  display: 'flex',
  fd: 'column',
  overflow: 'auto',
  bc: '#fff',
  gap: '$13',
  height: '100%',
  padding: '$9',
  '.VizComponentContainer': {
    width: '100%',
    height: '100%',
    display: 'flex',
    ai: 'center',
    gap: '$9',
    jc: 'center',
    padding: '$5',
    br: '$3',
    '.RunLogRecords': {
      padding: 0,
    },
    '&__contentWrapper': {
      border: 'none',
    },
  },
});

export {
  BoardVisualizerContainer,
  BoardVisualizerPane,
  BoardVisualizerEditorPane,
  BoardComponentsViz,
  BoardVisualizerComponentsPane,
  BoardConsole,
};
