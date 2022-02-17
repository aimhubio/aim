import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import { ICardProps } from './Card.d';

import './Card.scss';

function Card({
  name,
  title,
  children,
  className,
  tableColumns,
  isLoading,
  data,
}: ICardProps): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<any>(null);

  return (
    <div className={classNames('Card', { [className as string]: className })}>
      <div className='Card__header'>
        <Text size={18} weight={600} tint={100}>
          {name}
        </Text>
        {title && (
          <Text size={12} tint={70} className='Card__header__subTitle'>
            {title}
          </Text>
        )}
      </div>
      {children || (
        <div className='Card__tableWrapper'>
          <DataList
            tableRef={tableRef}
            data={data}
            isLoading={isLoading}
            tableColumns={tableColumns}
          />
        </div>
      )}
    </div>
  );
}

Card.displayName = 'Card';

export default React.memo<ICardProps>(Card);
