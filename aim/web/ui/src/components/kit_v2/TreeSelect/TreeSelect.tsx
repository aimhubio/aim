import React from 'react';
import { TreeSelect } from 'antd';

import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches/stitches.config';

import Box from '../Box';
import Badge from '../Badge';

import { ITreeSelectProps } from './TreeSelect.d';

import 'antd/es/tree-select/style/index.css';
import 'antd/es/select/style/index.css';
import './TreeSelect.css';

const { SHOW_PARENT } = TreeSelect;

const initialData: any = [
  {
    value: 'parent 1',
    title: 'parent 1',
    key: 'parent 1',
    children: [
      {
        value: 'parent 1-0',
        title: 'parent 1-0',
        children: [
          {
            value: 'my leaf',
            title: 'my leaf',
          },
          {
            value: 'your leaf',
            title: 'your leaf',
            children: [
              {
                value: 'leaf3',
                title: 'leaf3',
              },
            ],
          },
        ],
      },
      {
        value: 'parent 1-1',
        title: 'parent 1-1',
        key: 'parent 1-1',
        children: [
          {
            value: 'sss',
            title: 'sss',
          },
        ],
      },
    ],
  },
  {
    value: 'parent 2',
    title: 'parent 2',
    key: 'parent 2',
  },
];

const TreeSelectWrapper = styled(Slot, {
  '&.ant-select': {
    fontSize: '$3',
    color: '$textPrimary',
  },
  '& .ant-select-selector': {
    p: '0 !important',
    br: '$3 !important',
  },
  '&.ant-select:not(.ant-select-customize-input) .ant-select-selector': {
    border: 'none',
    bs: '0px 0px 0px 1px $colors$secondary50',
    '&:hover': {
      bs: '0px 0px 0px 1px $colors$secondary100',
    },
  },
  '&.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector':
    {
      bs: '0px 0px 0px 1px $colors$primary100',
      border: 'none',
    },
  '.ant-select-selection-placeholder': {
    left: '$8 !important',
  },
  '.ant-select-selection-overflow': {
    m: '$3 0',
    gap: '$4 0',
  },
  variants: {
    size: {
      sm: {
        '.ant-select-selector': {
          pl: '$6 !important',
          pr: '$16 !important',
          height: '$sizes$3',
        },
      },
      md: {
        '.ant-select-selector': {
          pl: '$7 !important',
          pr: '$17 !important',
          minHeight: '$sizes$5 !important',
          '.ant-select-selection-placeholder': {
            left: '$9 !important',
          },
        },
      },
      lg: {
        '.ant-select-selector': {
          pl: '$8 !important',
          pr: '$18 !important',
          height: '$sizes$7 !important',
          '.ant-select-selection-placeholder': {
            left: '$10 !important',
          },
        },
      },
    },
  },
});

const DropdownWrapper = styled('div', {
  '.ant-tree, .ant-select-tree': {
    '.ant-tree-treenode, .ant-select-tree-treenode': {
      height: '$5',
      display: 'flex',
      ai: 'center',
      width: '100%',
      p: 0,
      '&:hover': {
        bc: '#EFF0F2',
      },
    },
    '.ant-select-tree-list-holder-inner .ant-select-tree-treenode .ant-select-tree-node-content-wrapper':
      {
        flex: 'unset',
      },
    '.ant-tree-switcher, .ant-select-tree-switcher': {
      size: '$1',
      display: 'flex',
      alignSelf: 'unset',
      ai: 'center',
      jc: 'center',
    },
    '.ant-tree-node-content-wrapper, .ant-select-tree-node-content-wrapper': {
      display: 'flex',
      ai: 'center',
      jc: 'center',
      '&.ant-tree-node-selected, &.ant-select-tree-node-selected': {
        bc: '$primary',
      },
      '&:hover': {
        bc: 'unset',
      },
    },
  },

  '.ant-tree-checkbox, .ant-select-tree-checkbox': {
    m: 0,
    size: '$1',
    display: 'flex',
    ai: 'center',
    jc: 'center',
    border: 'unset',
  },
  '.ant-tree-checkbox-indeterminate, .ant-select-tree-checkbox-indeterminate': {
    '.ant-tree-checkbox-inner, .ant-select-tree-checkbox-inner': {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
    '.ant-tree-checkbox-inner::after, .ant-select-tree-checkbox-inner::after': {
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
  '.ant-tree-checkbox-checked, .ant-select-tree-checkbox-checked': {
    '&:after': {
      display: 'none',
    },
    '.ant-tree-checkbox-inner, .ant-select-tree-checkbox-inner': {
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
  '.ant-tree-checkbox-inner, .ant-select-tree-checkbox-inner': {
    size: '10px',
    border: 'unset',
    bs: 'inset 0 0 0 1px $colors$secondary100',
  },
  '.ant-select-empty': {
    textAlign: 'center',
  },
});

function Select({
  size = 'md',
  virtual = true,
  multiple = true,
  showArrow = true,
  allowClear = true,
  showSearch = true,
  treeCheckable = true,
  notFoundContent = 'No Data',
  showCheckedStrategy = SHOW_PARENT,
  disabled,
  ...props
}: ITreeSelectProps): React.FunctionComponentElement<React.ReactNode> {
  const [value, setValue] = React.useState(['parent 1-0', 'your leaf']);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const onChange = (newValue: any, e: any, a: any) => {
    setValue(newValue);
  };

  const treeData = React.useMemo(() => {
    const loop = (data: any): any =>
      data.map((item: any) => {
        const strTitle = item.title as string;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <Box as='span' css={{ bc: '$mark' }}>
                {searchValue}
              </Box>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );
        if (item.children) {
          return { title, value: item.value, children: loop(item.children) };
        }

        return {
          title,
          value: item.value,
        };
      });

    return loop(initialData);
  }, [searchValue]);

  function onSearchChange(val: string) {
    setSearchValue(val);
  }

  function filterTreeNode(inputValue: string, treeNode: any) {
    return treeNode.value.indexOf(inputValue) > -1;
  }

  return (
    <TreeSelectWrapper size={size}>
      <TreeSelect
        {...props}
        virtual
        multiple={multiple}
        showArrow={showArrow}
        allowClear={allowClear}
        showSearch={showSearch}
        size='small'
        treeCheckable={treeCheckable}
        value={value as any}
        treeData={treeData}
        notFoundContent={notFoundContent}
        searchValue={searchValue}
        placeholder={props.placeholder || 'please select'}
        filterTreeNode={filterTreeNode}
        style={{ width: '100%' }}
        showCheckedStrategy={showCheckedStrategy}
        maxTagPlaceholder={(o) => `${o.length} items`}
        maxTagCount={2}
        tagRender={({ value, onClose }) => {
          return (
            <Badge
              size='xs'
              css={{ mr: '$4' }}
              label={value}
              onDelete={() => onClose()}
            />
          );
        }}
        dropdownRender={(menu) => <DropdownWrapper>{menu}</DropdownWrapper>}
        onSearch={onSearchChange}
        onChange={onChange}
      />
    </TreeSelectWrapper>
  );
}

export default React.memo(Select);
