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

const BoardSpinner = styled('div', {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: 2,
  display: 'flex',
  ai: 'center',
  jc: 'center',
});

const BoardVisualizerComponentsPane = styled(SplitPaneItem, {
  position: 'relative',
  flex: 1,
  display: 'flex',
  fd: 'column',
  '.ResizeElement': {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
    bc: '#fff',
    minHeight: '$3',
    width: '100% !important',
  },
  '.ResizeElement__gutter__top': {
    bs: 'inset 0 1px 0 0 $colors$border30',
  },
  '.BoxVirtualizer': {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#f7f7f7',
    border: '1px solid $border30',
  },
  '.BoxVirtualizer__placeholder': {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '200px',
    height: '30px',
    backgroundColor: '#fff',
    borderBottom: '1px solid $border30',
    border: '1px solid $border30',
    zIndex: 3,
  },
  '.BoxVirtualizer__container': {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'auto',
  },
  '.BoxVirtualizer__grid': {
    display: 'inline',
    overflow: 'hidden',
  },
  '.BoxVirtualizer__container__verticalRuler': {
    position: 'sticky',
    top: '0px',
    height: '30px',
    minWidth: '100%',
    border: '1px solid $border30',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  '.block--row': {
    display: 'flex',
    fd: 'row',
    width: '100%',
    jc: 'center',
    gap: '$9',
    fw: 'wrap',
  },
  '.block--column': {
    display: 'inline-flex',
    fd: 'column',
    flex: 1,
    gap: '$9',
    jc: 'center',
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

const BoardConsoleElement = styled('pre', {
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
  p: '$9',
  '.VizComponentContainer': {
    width: '100%',
    height: '100%',
    display: 'flex',
    ai: 'center',
    gap: '$9',
    jc: 'center',
    p: '$5',
    border: '1px solid $border30',
    br: '$3',
    '.RunLogRecords': {
      p: 0,
    },
    '&__contentWrapper': {
      border: 'none',
    },
  },
});

const BoardBlockTab = styled('div', {
  width: '100%',
  height: 'calc(500px + 2 * $5)',
  p: '$5',
  overflow: 'auto',
});

export {
  BoardVisualizerContainer,
  BoardVisualizerPane,
  BoardVisualizerEditorPane,
  BoardComponentsViz,
  BoardVisualizerComponentsPane,
  BoardConsoleElement,
  BoardBlockTab,
  BoardSpinner,
};
