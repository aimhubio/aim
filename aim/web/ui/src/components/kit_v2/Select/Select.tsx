import React from 'react';
import ReactSelect from 'react-select';

import type { DataNode } from 'antd/es/tree';

import Icon from 'components/kit/Icon';

import Checkbox from '../Checkbox';

import TreeList from './TreeList/TreeList';

import 'antd/es/tree/style/index.css';

const dig = (path = '0', level = 3) => {
  const list = [];
  for (let i = 0; i < 3; i += 1) {
    const key = `${path}-${i}`;
    const treeNode: DataNode = {
      title: key,
      key,
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
  const [searchValue, setSearchValue] = React.useState<string | null>('');
  const [checkedKeys, setCheckedKeys] = React.useState<
    { key: string; value: boolean | 'indeterminate' }[]
  >([]);

  console.log(
    '🚀 ~ file: Select.tsx ~ line 34 ~ Select ~ searchValue',
    searchValue,
  );
  function onCheckChange(check: any, key: string) {
    if (check === true) {
      setCheckedKeys([...checkedKeys, { key, value: true }]);
    } else {
      setCheckedKeys(checkedKeys.filter((item) => item.key !== key));
    }
  }
  return (
    <>
      <ReactSelect
        menuIsOpen={true}
        value={searchValue}
        onInputChange={(value) => setSearchValue(value)}
        closeMenuOnSelect={false}
        components={{
          MenuList: () => (
            <TreeList
              searchValue={searchValue}
              data={treeData}
              height={400}
              checkedKeys={checkedKeys}
              onCheckChange={onCheckChange}
            />
          ),
        }}
      />
      {/* <TreeList searchValue={'0-0'} data={treeData} height={400} /> */}
    </>
  );
}

export default Select;
