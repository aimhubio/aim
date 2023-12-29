import React from 'react';
import { Tree as TreeComponent } from 'antd';

import Text from 'components/kit_v2/Text';

import { ITreeProps } from './Tree.d';
import { TreeListWrapper } from './Tree.style';

import 'antd/es/tree/style/index.css';

type DataNode = {
  key: string;
  title?: React.ReactNode | ((data: DataNode) => React.ReactNode) | string;
  value?: string;
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

const TreeList = ({ searchValue = '', data = [], ...props }: ITreeProps) => {
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>(
    props.expandedKeys || [],
  );
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
    const processTreeData = (d: DataNode[]): DataNode[] =>
      d.map((item) => {
        let strTitle: string =
          typeof item.title === 'string' ? item.title : item.value || '';
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const searchedTitle =
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
            title: searchValue ? searchedTitle : item.title,
            key: item.key,
            children: processTreeData(item.children),
          };
        }

        return {
          ...item,
          title: searchValue ? searchedTitle : item.title,
          key: item.key,
        };
      });

    return processTreeData(data);
  }, [data, searchValue]);

  return (
    <TreeListWrapper>
      <TreeComponent
        {...props}
        height={props.height ?? 300}
        showIcon
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={treeData}
      />
    </TreeListWrapper>
  );
};

export default React.memo(TreeList);
