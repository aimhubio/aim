import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Link, Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import StatusLabel from 'components/StatusLabel';
import ExperimentNameBox from 'components/ExperimentNameBox';

import { PathEnum } from 'config/enums/routesEnum';

import { IFeedItemProps } from '.';

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
            <div className='FeedItem__content__item__leftBox'>
              <Text
                tint={50}
                size={12}
                className='FeedItem__content__item__leftBox__date'
              >
                {item.date}
              </Text>
              <Text
                size={12}
                tint={100}
                className='FeedItem__content__item__leftBox__label'
              >
                Started a run:
              </Text>
              <Tooltip title={item.active ? 'In Progress' : 'Finished'}>
                <div className='FeedItem__content__item__leftBox__indicatorBox'>
                  <StatusLabel
                    className='Table__status_indicator'
                    status={item.active ? 'success' : 'alert'}
                  />
                </div>
              </Tooltip>
            </div>
            <div className='FeedItem__content__item__itemBox'>
              <ExperimentNameBox
                experimentName={item.experiment}
                experimentId={item.experimentId}
              />
              <Text size={10}>/</Text>
              <Tooltip title={item.name}>
                <div className='FeedItem__content__item__itemBox__runName'>
                  <Link
                    to={PathEnum.Run_Detail.replace(':runHash', item.hash)}
                    component={RouteLink}
                  >
                    {item.name}
                  </Link>
                </div>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(FeedItem);
