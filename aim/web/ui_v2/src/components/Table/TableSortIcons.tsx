import React from 'react';
import Icon from 'components/Icon/Icon';

type Props = {
  sort: string | null;
  sortFields?: any[];
  onSort: () => void;
};

export default function TableSortIcons(props: Props) {
  return props.sort ? (
    <span className='TableColumn__SortIcon' onClick={props.onSort}>
      {props.sort === 'asc' && <Icon name='back-up' color='#3C4043' />}
      {props.sort === 'desc' && <Icon name='back-down' color='#3C4043' />}
    </span>
  ) : (
    <span className='TableColumn__SortIcon' onClick={props.onSort}>
      {<Icon name='back-up' color='#E6E6E6' />}
    </span>
  );
}
