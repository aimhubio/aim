import { styled } from 'config/stitches';

const TreeListWrapper = styled('div', {
  '.ant-tree': {
    '.ant-tree-treenode': {
      position: 'relative',
      height: '$5',
      display: 'flex',
      ai: 'center',
      width: '100%',
      br: '$3',
      p: 0,
      '&:hover': {
        bc: '$background-hover-neutral-airly',
        '.ant-tree-checkbox:not(.ant-tree-checkbox-checked)': {
          '.ant-tree-checkbox-inner': {
            bs: 'inset 0 0 0 1px $colors$icon-hover-primary-bold',
          },
        },
      },
    },
    '.ant-tree-treenode-selected': {
      bc: '$background-hover-neutral-airly',
    },
    '.ant-tree-switcher-noop': {
      width: '0 !important', // Set the margin to your preferred value
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
        bc: 'unset',
      },
      '&:hover': {
        bc: 'unset',
      },
      '.ant-tree-iconEle': {
        display: 'flex',
        ai: 'center',
        jc: 'center',
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
      bs: 'inset 0 0 0 1px $colors$icon-default-primary-plain',
    },
    '.ant-tree-checkbox-inner::after': {
      top: '50%',
      left: '50%',
      size: '6px',
      br: '$1',
      bc: '$icon-default-primary-plain',
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
      bc: '$icon-default-primary-plain',
      bs: 'inset 0 0 0 1px $colors$icon-default-primary-plain',
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
    bs: 'inset 0 0 0 1px $colors$icon-default-text-soft',
  },
});

export { TreeListWrapper };
