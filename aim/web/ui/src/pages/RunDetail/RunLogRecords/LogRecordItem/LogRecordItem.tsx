import React from 'react';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';

import { Icon, JsonViewPopover, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import DictVisualizer from 'components/kit/DictVisualizer';

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
            className='LogRecordItem__content-title'
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
                <div className='LogRecordItem__content__item__leftBox__statusBadge'>
                  <Icon
                    name={RunLogRecordsConfig[item?.type ?? 'ERROR'].icon}
                    fontSize={16}
                    color={RunLogRecordsConfig[item?.type ?? 'ERROR'].color}
                  />
                </div>
                <div className='LogRecordItem__content__item__leftBox__content'>
                  <Text
                    tint={70}
                    size={12}
                    weight={600}
                    className='LogRecordItem__content__item__leftBox__date'
                  >
                    {item?.type}
                  </Text>
                  <Text
                    tint={50}
                    size={12}
                    className='LogRecordItem__content__item__leftBox__date'
                  >
                    {item?.date ?? 'no date found'}
                  </Text>
                </div>
              </div>
              <div
                className='LogRecordItem__content__item__itemBox'
                style={{
                  justifyContent: item.extraParams ? 'flex-start' : 'center',
                }}
              >
                <Tooltip title={item?.message ?? 'no message found'}>
                  <div>
                    <Text
                      className='LogRecordItem__content__item__itemBox__message'
                      component='pre'
                      size={14}
                    >
                      {item?.message ?? 'no message found'}
                    </Text>
                  </div>
                </Tooltip>

                {item.extraParams && (
                  <div className='LogRecordItem__content__item__itemBox__extraParams'>
                    <ControlPopover
                      key={item.hash}
                      title='Message Payload'
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      anchor={({ onAnchorClick }) => (
                        <div
                          className='LogRecordItem__content__item__itemBox__extraParams__dict'
                          onClick={(e) => {
                            if (!_.isEmpty(item.extraParams)) {
                              onAnchorClick(e);
                            }
                          }}
                        >
                          <div>
                            <DictVisualizer
                              src={item.extraParams}
                              style={{ width: 500, height: 300 }}
                              autoScale
                            />
                          </div>
                          <div className='LogRecordItem__content__item__itemBox__extraParams__dict__overflowHandler'>
                            <Icon name='arrow-bidirectional-open' />
                          </div>
                        </div>
                      )}
                      component={
                        <JsonViewPopover
                          json={item.extraParams}
                          dictVisualizerSize={{ width: 500, height: 300 }}
                        />
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case ListItemEnum.EMPTY:
        <div></div>;
    }
  };

  return (
    <div className='LogRecordItem' style={props.style}>
      {itemRenderer()}
    </div>
  );
}

export default React.memo(LogRecordItem);
