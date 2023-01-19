import React from 'react';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';

import { Icon, JsonViewPopover, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import contextToString from 'utils/contextToString';

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
                <div
                  className='LogRecordItem__content__item__leftBox__statusBadge'
                  style={{
                    backgroundColor:
                      RunLogRecordsConfig[item?.type ?? 'Error'].background,
                  }}
                >
                  <Icon
                    name={RunLogRecordsConfig[item?.type ?? 'Error'].icon}
                    fontSize={10}
                    color={RunLogRecordsConfig[item?.type ?? 'Error'].color}
                  />
                </div>
                <Text
                  tint={50}
                  size={12}
                  className='LogRecordItem__content__item__leftBox__date'
                >
                  {item?.date ?? 'no date found'}
                </Text>
              </div>
              <div className='LogRecordItem__content__item__itemBox'>
                <Text
                  className='LogRecordItem__content__item__itemBox__message'
                  size={14}
                >
                  {item?.message ?? 'no message found'}
                </Text>
                {!_.isEmpty(item.extraParams) ? (
                  <ControlPopover
                    key={item.hash}
                    title={'Message Params'}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    anchor={({ onAnchorClick }) => (
                      <Tooltip title={contextToString(item.extraParams) ?? ''}>
                        <div
                          className='LogRecordItem__content__item__itemBox__extraParams'
                          onClick={onAnchorClick}
                        >
                          <Text size={14} color='info'>
                            {contextToString(item.extraParams)}
                          </Text>
                        </div>
                      </Tooltip>
                    )}
                    component={<JsonViewPopover json={item.extraParams} />}
                  />
                ) : null}
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
