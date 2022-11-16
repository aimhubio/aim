import { Tree } from 'antd';
import ReactSelect from 'react-select';

import type { DataNode } from 'antd/es/tree';

import 'antd/dist/antd.css';

const dig = (path = '0', level = 3) => {
  const list = [];
  for (let i = 0; i < 10; i += 1) {
    const key = `${path}-${i}`;
    const treeNode: DataNode = {
      title: key,
      key,
      //   icon: <Icon name='check' />,
      //   switcherIcon: <Icon name='check' />,
    };

    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }

    list.push(treeNode);
  }
  return list;
};

const treeData = dig();

function Select(): React.FunctionComponentElement<React.ReactNode> {
  const Menu = () => (
    <Tree
      // icon={<Icon name='search' />}
      treeData={treeData}
      height={233}
      defaultExpandAll
      // checkable
    />
  );
  return (
    <>
      <ReactSelect
        components={{
          MenuList: Menu,
        }}
      />
      <div style={{ width: 200, height: 300 }}>
        <Tree
          // icon={<Icon name='search' />}
          treeData={treeData}
          height={233}
          defaultExpandAll
          checkable
        />
      </div>
    </>
  );
}

export default Select;
