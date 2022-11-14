import React from 'react';

import { Icon, Text } from 'components/kit';
import RunNameColumn from 'components/Table/RunNameColumn';

import { IFeedItemProps } from './FeedItem.d';

import './FeedItem.scss';

function FeedItem(
  props: IFeedItemProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='FeedItem'>
      <div className='FeedItem__title'>
        <Icon name='calendar' fontSize={10} box />
        <Text tint={50} size={10} weight={700}>
          {props.date.split('_').join(' ')}
        </Text>
      </div>
      <div className='FeedItem__content'>
        {props.data.map((item) => (
          <div className='FeedItem__content__item' key={item.name}>
            <Text size={12} tint={100}>
              Started a run:
            </Text>
            <RunNameColumn
              run={`${item.experiment} / ${item.name}`}
              active={item.active}
              runHash={item.hash}
            />
            <Text tint={50} size={10}>
              {item.date}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(FeedItem);
