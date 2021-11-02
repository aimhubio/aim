import React from 'react';

import { Icon, Button } from 'components/kit';

type Props = {
  sort: string | null;
  sortFields?: any[];
  onSort: () => void;
};

export default function TableSortIcons(
  props: Props,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Button
      withOnlyIcon
      className='TableColumn__SortButton'
      size='small'
      onClick={props.onSort}
    >
      <Icon
        name='sort-arrow-up'
        color={props.sort === 'asc' ? '#3C4043' : '#83899E'}
      />
      <Icon
        name='sort-arrow-down'
        color={props.sort === 'desc' ? '#3C4043' : '#83899E'}
      />
    </Button>
  );
}
