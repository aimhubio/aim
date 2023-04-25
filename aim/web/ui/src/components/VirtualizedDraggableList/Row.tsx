import React from 'react';
import { areEqual, ListChildComponentProps } from 'react-window';
import { Draggable } from 'react-beautiful-dnd';

import type { Item } from './';
import { ItemComponent } from './';

function Row(props: ListChildComponentProps<Item[]>) {
  const { data: items, index, style } = props;
  const item = items[index];
  return (
    <Draggable draggableId={item.id} index={index} key={item.id}>
      {(provided) => (
        <ItemComponent provided={provided} item={item} style={style} />
      )}
    </Draggable>
  );
}

export default React.memo(Row, areEqual);
