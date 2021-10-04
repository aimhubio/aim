import React from 'react';
import Icon from 'components/Icon/Icon';

type Props = {
  sort: string | null;
  sortFields?: any[];
  onSort: () => void;
};

export default function TableSortIcons(props: Props) {
  return (
    <span className='TableColumn__SortIcon' onClick={props.onSort}>
      <Icon
        name='sort-arrow-up'
        color={props.sort === 'asc' ? '#3C4043' : '#83899E'}
      />
      <Icon
        name='sort-arrow-down'
        color={props.sort === 'desc' ? '#3C4043' : '#83899E'}
      />
    </span>
  );
}
