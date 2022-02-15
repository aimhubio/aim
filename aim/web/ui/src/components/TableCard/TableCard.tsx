import React from 'react';

import { Text } from 'components/kit';

import { ITableCardProps } from './TableCard.d';

import './TableCard.scss';

function TableCard({
  name,
  title,
}: ITableCardProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='TableCard'>
      <p>
        <Text size={18} weight={600} tint={100}>
          {name}
        </Text>
      </p>
      <p>
        <Text size={12}>{title}</Text>
      </p>
    </div>
  );
}

TableCard.displayName = 'TableCard';

export default React.memo<ITableCardProps>(TableCard);
