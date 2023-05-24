import React from 'react';
import { areEqual } from 'react-window';

import { IconCheck } from '@tabler/icons-react';

import Text from '../Text';
import Icon from '../Icon';
import ListItem from '../ListItem';
import { Checkbox } from '../Checkbox/Checkbox';

import { ISelectItemProps } from './Select.d';

/**
 * SelectItem component for react-window list
 * @param {ISelectItemProps} props - props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @category Components
 * @subcategory Select
 */
const SelectItem = ({
  data,
  index,
  style,
}: ISelectItemProps): React.FunctionComponentElement<React.ReactNode> => {
  const { items, value, onValueChange, multiple, size } = data;
  const item = items[index];
  let selected: boolean = false;
  if (item.value) {
    if (value === item.value) {
      selected = true;
    } else if (value && Array.isArray(value)) {
      selected = value.indexOf(item.value) !== -1;
    }
  }

  const rightNode = multiple ? null : selected ? (
    <Icon css={{ color: '$primary100' }} icon={<IconCheck />} />
  ) : null;

  return (
    <>
      {item.group ? (
        <Text
          css={{ p: '0 $5', display: 'flex', ai: 'center' }}
          style={style}
          color='$textPrimary50'
          weight='$2'
          key={index}
        >
          {item.group}
        </Text>
      ) : (
        <ListItem
          css={{ ...style, p: '0 $8' }}
          key={index}
          size={size}
          rightNode={rightNode}
          leftNode={multiple ? <Checkbox checked={selected} /> : null}
          onClick={() => onValueChange(item.value!)}
        >
          <Text css={{ color: selected ? '$primary100' : '$textPrimary' }}>
            {item.label}
          </Text>
        </ListItem>
      )}
    </>
  );
};

SelectItem.displayName = 'SelectItem';
export default React.memo(SelectItem, areEqual);
