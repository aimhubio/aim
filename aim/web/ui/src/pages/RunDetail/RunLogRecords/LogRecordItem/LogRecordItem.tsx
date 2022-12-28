import React from 'react';

import { Badge, Icon, Text } from 'components/kit';

import { RunLogRecordsTypes } from './config';

import { ILogRecordItemProps } from '.';

import './LogRecordItem.scss';

function LogRecordItem(
  props: ILogRecordItemProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='LogRecordItem'>
      <div className='LogRecordItem__title'>
        <Icon name='calendar' fontSize={10} box />
        <Text tint={50} size={10} weight={700}>
          {props.date.split('_').join(' ')}
        </Text>
      </div>
      <div className='LogRecordItem__content'>
        {props.data.map((item) => (
          <div className='LogRecordItem__content__item' key={item.hash}>
            <div className='LogRecordItem__content__item__leftBox'>
              <Text
                tint={50}
                size={12}
                className='LogRecordItem__content__item__leftBox__date'
              >
                {item.date}
              </Text>
              <Badge
                size='xSmall'
                color={RunLogRecordsTypes[item.type].color}
                label={RunLogRecordsTypes[item.type].label}
                id={item.hash}
              />
            </div>
            <div className='LogRecordItem__content__item__itemBox'>
              <Text>{item.message}</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(LogRecordItem);
