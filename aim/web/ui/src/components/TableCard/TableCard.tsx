import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import { ITableCardProps } from './TableCard.d';

import './TableCard.scss';

function TableCard({
  name,
  title,
  children,
  className,
}: ITableCardProps): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<any>(null);
  const tableColumns = [
    {
      dataKey: 'd',
      key: 'd',
      title: 'D',
      width: 100,
    },
    {
      dataKey: 'a',
      key: 'a',
      title: 'A',
      width: 100,
    },
  ];
  return (
    <div
      className={classNames('TableCard', { [className as string]: className })}
    >
      <div className='TableCard__header'>
        <Text size={18} weight={600} tint={100}>
          {name}
        </Text>
        {title && (
          <Text size={12} tint={70} className='TableCard__header__subTitle'>
            {title}
          </Text>
        )}
      </div>
      {children || (
        <DataList
          tableRef={tableRef}
          data={[
            { key: 0, d: 2, a: 3 },
            { key: 1, d: 2, a: 3 },
          ]}
          isLoading={false}
          tableColumns={tableColumns}
        />
      )}
    </div>
  );
}

TableCard.displayName = 'TableCard';

export default React.memo<ITableCardProps>(TableCard);
