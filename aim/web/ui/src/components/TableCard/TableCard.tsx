import React from 'react';

import { Text } from 'components/kit';

import { ITableCardProps } from './TableCard.d';

import './TableCard.scss';

function TableCard({
  title,
}: ITableCardProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={'TableCard'}>
      <Text>{title}</Text>
    </div>
  );
}

TableCard.displayName = 'TableCard';

export default React.memo<ITableCardProps>(TableCard);
