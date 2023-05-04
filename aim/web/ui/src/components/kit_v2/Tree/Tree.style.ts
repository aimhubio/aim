import { styled } from 'config/stitches';

const TreeListWrapper = styled('div', {
  '.ant-tree': {
    '.ant-tree-treenode': {
      position: 'relative',
      height: '$5',
      display: 'flex',
      ai: 'center',
      width: '100%',
      p: 0,
      '&:hover': {
        bc: '#EFF0F2',
      },
    },
    '.ant-tree-switcher': {
      size: '$1',
      display: 'flex',
      alignSelf: 'unset',
      ai: 'center',
      jc: 'center',
      zIndex: 20,
    },
    '.ant-tree-node-content-wrapper': {
      display: 'flex',
      ai: 'center',
      jc: 'center',
      '&.ant-tree-node-selected': {
        bc: '$primary',
      },
      '&:hover': {
        bc: 'unset',
      },
    },
  },
  '.ant-tree-focused:not(:hover):not(.ant-tree-active-focused)': {
    background: 'unset',
  },
  '.ant-tree-checkbox': {
    m: 0,
    size: '$1',
    display: 'flex',
    ai: 'center',
    jc: 'center',
    border: 'unset',
    position: 'unset',
    '&::before': {
      content: '""',
      position: 'absolute',
      zIndex: 10,
      width: '100%',
      height: '100%',
      left: 0,
    },
  },
  '.ant-tree-checkbox-indeterminate': {
    '.ant-tree-checkbox-inner': {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
    '.ant-tree-checkbox-inner::after': {
      top: '50%',
      left: '50%',
      size: '6px',
      br: '$1',
      bc: '$primary100',
      border: 0,
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1,
      content: ' ',
    },
  },
  '.ant-tree-checkbox-checked': {
    '&:after': {
      display: 'none',
    },
    '.ant-tree-checkbox-inner': {
      bc: '$primary100',
      bs: 'inset 0 0 0 1px $colors$primary100',
      '&:after': {
        borderWidth: 1,
        transition: 'unset',
        width: '3px',
        height: '5px',
      },
    },
  },
  '.ant-tree-checkbox-inner': {
    size: '10px',
    border: 'unset',
    bs: 'inset 0 0 0 1px $colors$secondary100',
  },
});

export { TreeListWrapper };
