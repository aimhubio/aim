import React from 'react';

import { Icon, Text } from 'components/kit';

import { ListItemEnum, RunLogRecordsConfig } from './config';

import { ILogRecordItemProps } from '.';

import './LogRecordItem.scss';

function LogRecordItem(
  props: ILogRecordItemProps,
): React.FunctionComponentElement<React.ReactNode> {
  const item = props.data[props.index];

  const itemRenderer = () => {
    switch (item?.itemType) {
      case ListItemEnum.MONTH:
        return (
          <Text
            className='RunLogRecords__content-title'
            component='h3'
            tint={100}
            weight={700}
          >
            {item.date.split('_').join(' ')}
          </Text>
        );
      case ListItemEnum.DAY:
        return (
          <div className='LogRecordItem__title'>
            <Icon name='calendar' fontSize={10} box />
            <Text tint={50} size={10} weight={700}>
              {item.date.split('_').join(' ')}
            </Text>
          </div>
        );
      case ListItemEnum.RECORD:
        return (
          <div className='LogRecordItem__content'>
            <div className='LogRecordItem__content__item' key={item.hash}>
              <div className='LogRecordItem__content__item__leftBox'>
                <Text
                  tint={50}
                  size={12}
                  className='LogRecordItem__content__item__leftBox__date'
                >
                  {item?.date ?? 'no date found'}
                </Text>
                <Text color={RunLogRecordsConfig[item?.type ?? 'Error'].color}>
                  {RunLogRecordsConfig[item?.type ?? 'Error'].label}
                </Text>
              </div>
              <div className='LogRecordItem__content__item__itemBox'>
                <Text>{item?.message ?? 'no message found'}</Text>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='LogRecordItem' style={props.style}>
      {itemRenderer()}
    </div>
  );
}

export default React.memo(LogRecordItem);
