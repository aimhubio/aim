import React from 'react';
import { Tree as TreeComponent } from 'antd';

import Text from 'components/kit_v2/Text';

import { styled } from 'config/stitches/stitches.config';

import { ITreeProps } from './Tree.d';

import 'antd/es/tree/style/index.css';

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
  key: string;
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

const TreeList = ({ searchValue = '', data, ...props }: ITreeProps) => {
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);

  const dataList = React.useMemo(() => {
    const list: DataNode[] = [];
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
        .map((item) => {
          if (item.key.indexOf(searchValue) > -1) {
            return getParentKey(item.key, data);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      setExpandedKeys(newExpandedKeys as React.Key[]);
      setAutoExpandParent(true);
    }
  }, [data, dataList, searchValue]);

  const treeData = React.useMemo(() => {
    const loop = (d: DataNode[]): DataNode[] =>
      d.map((item) => {
        const strTitle = item.key as string;
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

  return (
    <TreeListWrapper>
      <TreeComponent
        {...props}
        height={props.height || 300}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={treeData}
      />
    </TreeListWrapper>
  );
};

export default React.memo(TreeList);
