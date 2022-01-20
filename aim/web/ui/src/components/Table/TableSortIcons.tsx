import React from 'react';

import { Icon, Button } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

type Props = {
  sort: string | null;
  onSort: () => void;
};

export default function TableSortIcons(
  props: Props,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
