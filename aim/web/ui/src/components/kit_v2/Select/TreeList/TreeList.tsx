import React, { useMemo, useState } from 'react';
import { Tree } from 'antd';

import Text from 'components/kit_v2/Text';

import { styled } from 'config/stitches/stitches.config';

const TreeListWrapper = styled('div', {
  '.ant-tree': {
    '.ant-tree-treenode': {
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
    },
    '.ant-tree-node-content-wrapper': {
      display: 'flex',
      ai: 'center',
      jc: 'center',
      '&.ant-tree-node-selected': {
        bc: '$primary',
      },
    },
  },

  '.ant-tree-checkbox': {
    m: 0,
    size: '$1',
    display: 'flex',
    ai: 'center',
    jc: 'center',
    border: 'unset',
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

type DataNode = {
  key: string | number;
  title?: React.ReactNode | ((data: DataNode) => React.ReactNode);
  children?: DataNode[];
};

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

const TreeList = ({
  searchValue,
  data,
  height,
  checkedKeys,
  onCheckChange,
}: any) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const dataList = useMemo(() => {
    const list: any = [];
    const generateList = (nodes: DataNode[]) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const { key } = node;
        list.push({ key, title: key });
        if (node.children) {
          generateList(node.children);
        }
      }
    };
    generateList(data);
    return list;
  }, [data]);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  React.useEffect(() => {
    if (searchValue) {
      const newExpandedKeys = dataList
        .map((item: any) => {
          if (item.title.indexOf(searchValue) > -1) {
            return getParentKey(item.key, data);
          }
          return null;
        })
        .filter(
          (item: any, i: any, self: any) => item && self.indexOf(item) === i,
        );
      setExpandedKeys(newExpandedKeys as React.Key[]);
      setAutoExpandParent(true);
    }
  }, [data, dataList, searchValue]);

  const treeData = useMemo(() => {
    const loop = (d: DataNode[]): DataNode[] =>
      d.map((item: any) => {
        const strTitle = item.title as string;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <Text>
              {beforeStr}
              <Text css={{ bc: '$mark' }}>{searchValue}</Text>
              {afterStr}
            </Text>
          ) : (
            <Text>{strTitle}</Text>
          );
        if (item.children) {
          return {
            ...item,
            title,
            key: item.key,
            children: loop(item.children),
          };
        }

        return {
          ...item,
          title,
          key: item.key,
        };
      });

    return loop(data);
  }, [data, searchValue]);

  console.log(treeData, 'treeData');
  return (
    <TreeListWrapper>
      <Tree
        showIcon
        multiple
        // checkedKeys={checkedKeys.map((item: any) => item.key)}
        checkable={true}
        height={height}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={treeData}
      />
    </TreeListWrapper>
  );
};

export default React.memo(TreeList);
