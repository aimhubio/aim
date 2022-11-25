import React from 'react';
// import ReactSelect, { components } from 'react-select';
import { Tree, TreeSelect } from 'antd';

import type { DataNode } from 'antd/es/tree';

import { styled } from 'config/stitches/stitches.config';

import Box from '../Box';

import 'antd/es/tree-select/style/index.css';
import 'antd/es/select/style/index.css';

const { SHOW_PARENT } = TreeSelect;

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const initialData = [
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
];

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
});

function Select(props: any): React.FunctionComponentElement<React.ReactNode> {
  const [value, setValue] = React.useState<string | undefined>();
  const [searchValue, setSearchValue] = React.useState<string>('parent');
  const onChange = (newValue: string) => {
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

  return (
    <TreeSelect
      virtual
      showSearch
      allowClear
      multiple
      showArrow
      autoClearSearchValue={false}
      treeCheckable
      filterTreeNode={(inputValue, treeNode: any) => {
        console.log(inputValue, treeNode);
        // return false;
        return treeNode.value.indexOf(inputValue) > -1;
      }}
      notFoundContent={null}
      style={{ width: '100%' }} // treeDefaultExpandAll
      treeData={treeData}
      value={value}
      searchValue={searchValue}
      placeholder='Please select'
      showCheckedStrategy={SHOW_PARENT}
      dropdownRender={(menu) => <DropdownWrapper>{menu}</DropdownWrapper>}
      // open={true}
      onSearch={onSearchChange}
      onChange={onChange}
    />
  );
}

export default Select;
