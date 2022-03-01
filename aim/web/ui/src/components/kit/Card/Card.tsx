import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import { ICardProps } from './Card.d';

import './Card.scss';

/**
 * @property {string} title - title
 * @property {string} subTitle - subtitle (optional)
 * @property {string} className - additional class name (optional)
 * @property {boolean} isLoading - is loading
 * @property {{
 * tableColumns: any,
 * tableData: any,
 * searchableKeys?: string[],
 * illustrationConfig?: IIllustrationConfig,
 * isLoading: boolean,
 * }} dataListProps - table props
 * @property {React.HTMLElement} children - children element
 */

function Card({
  title,
  subtitle,
  className,
  dataListProps,
  children,
}: ICardProps): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<any>(null);

  return (
    <div className={classNames('Card', { [className as string]: className })}>
      <div className='Card__header'>
        <Text size={18} weight={600} tint={100}>
          {title}
        </Text>
        {subtitle && (
          <Text
            size={12}
            tint={70}
            weight={400}
            className='Card__header__subTitle'
          >
            {subtitle}
          </Text>
        )}
      </div>
      {children || (
        <div className='Card__tableWrapper'>
          {dataListProps?.tableData && (
            <DataList tableRef={tableRef} {...dataListProps} />
          )}
        </div>
      )}
    </div>
  );
}

Card.displayName = 'Card';

export default React.memo<ICardProps>(Card);
