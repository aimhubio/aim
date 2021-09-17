import React from 'react';
import Icon from 'components/Icon/Icon';

type Props = {
  onClickSort: () => null;
  sort: string | null;
};

export default function TableSortIcons(props: Props) {
  return props.sort ? (
    <span className='TableColumn__SortIcon'>
      {props.sort === 'asc' && <Icon name='back-up' color='#B5B9C5' />}
      {props.sort === 'desc' && <Icon name='back-down' color='#B5B9C5' />}
    </span>
  ) : null;
}
