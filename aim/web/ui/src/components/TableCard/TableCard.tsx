import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';

import { ITableCardProps } from './TableCard.d';

import './TableCard.scss';

function TableCard({
  name,
  title,
  children,
  className,
}: ITableCardProps): React.FunctionComponentElement<React.ReactNode> {
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
      {children || <div>asfasf</div>}
    </div>
  );
}

TableCard.displayName = 'TableCard';

export default React.memo<ITableCardProps>(TableCard);
