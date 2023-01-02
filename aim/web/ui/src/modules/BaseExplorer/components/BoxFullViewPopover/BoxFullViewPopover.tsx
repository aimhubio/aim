import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';
import { Link as RouteLink } from 'react-router-dom';

import { Dialog, Link, Tooltip } from '@material-ui/core';

import { Badge, Button, Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';

import { PathEnum } from 'config/enums/routesEnum';
import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { processDurationTime } from 'utils/processDurationTime';
import { formatValue } from 'utils/formatValue';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';
import contextToString from 'utils/contextToString';

import { IBoxFullViewPopoverProps } from '.';

import './BoxFullViewPopover.scss';

function BoxFullViewPopover({
  onClose,
  sequenceName,
  groupInfo,
  children,
  item,
}: IBoxFullViewPopoverProps) {
  const data = React.useMemo(() => {
    const { run: runData, [sequenceName]: sequenceData } = item;
    let runInfo: { icon: string; value: string | React.ReactElement }[] = [];
    let sequence: { label: string; value: string | React.ReactElement }[] = [];
    if (runData) {
      runInfo = [
        {
          icon: 'runs',
          value: (
            <Link
              to={PathEnum.Run_Detail.replace(':runHash', runData.hash)}
              component={RouteLink}
            >
              {runData.name}
            </Link>
          ),
        },
        {
          icon: 'link',
          value: (
            <Link
              to={PathEnum.Experiment.replace(
                ':experimentId',
                runData.experimentId,
              )}
              component={RouteLink}
            >
              {runData.experiment}
            </Link>
          ),
        },
        {
          icon: 'calendar',
          value: `${moment(runData.creation_time * 1000).format(
            DATE_WITH_SECONDS,
          )}`,
        },
        {
          icon: 'time',
          value: processDurationTime(
            runData.creation_time * 1000,
            runData.end_time ? runData.end_time * 1000 : Date.now(),
          ),
        },
      ];
    }
    if (sequenceData) {
      sequence = [
        {
          label: 'name',
          value: sequenceData.name,
        },
        {
          label: 'context',
          value: (
            <Badge
              className='BoxFullViewPopover__container__detail-item__badge'
              monospace
              size='xSmall'
              label={contextToString(sequenceData.context) || 'Empty Context'}
            />
          ),
        },
        {
          label: 'step',
          value: item.record?.step,
        },
      ];
    }
    return {
      runInfo,
      sequence,
      groups: groupInfo,
    };
  }, [item, sequenceName, groupInfo]);

  return (
    <ErrorBoundary>
      <Dialog onClose={onClose} className='BoxFullViewPopover' open>
        <div className='BoxFullViewPopover__container'>
          {children}
          <div className='BoxFullViewPopover__container__detail'>
            <div className='BoxFullViewPopover__container__detail-close'>
              <Button
                withOnlyIcon
                size='small'
                onClick={onClose}
                color='inherit'
              >
                <Icon name='close' />
              </Button>
            </div>
            <div className='BoxFullViewPopover__container__detail-section'>
              <Text weight={600} size={18} tint={100} component='h3'>
                Run
              </Text>
              {data.runInfo.map((item: any, index: number) => (
                <div
                  key={index}
                  className='BoxFullViewPopover__container__detail-item'
                >
                  <Icon
                    name={item.icon}
                    weight={item.icon === 'time' ? 600 : 500}
                    fontSize={14}
                  />
                  <Text className='BoxFullViewPopover__container__detail__truncatedInfo'>
                    {item.value}
                  </Text>
                </div>
              ))}
            </div>
            {item.run?.hash && (
              <div className='BoxFullViewPopover__container__detail-section'>
                <ErrorBoundary>
                  <AttachedTagsList runHash={item.run.hash} />
                </ErrorBoundary>
              </div>
            )}
            <div className='BoxFullViewPopover__container__detail-section'>
              <Text weight={600} size={18} tint={100} component='h3'>
                {sequenceName}
              </Text>
              {data.sequence.map((item: any, index: number) => (
                <div className='flex' key={index}>
                  <Text className='BoxFullViewPopover__container__detail-item__withSpace'>
                    {item.label}:
                  </Text>
                  <Tooltip title={item.value}>
                    <div>
                      <Text
                        tint={100}
                        className='BoxFullViewPopover__container__detail__truncatedInfo'
                      >
                        {item.value}
                      </Text>
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
            {!_.isEmpty(data.groups) && (
              <div className='BoxFullViewPopover__container__detail-section'>
                <Text weight={600} size={18} tint={100} component='h3'>
                  Group Config
                </Text>
                <div>
                  {Object.keys(data.groups).map((groupConfigKey: string) =>
                    _.isEmpty(data.groups[groupConfigKey]) ? null : (
                      <div
                        key={groupConfigKey}
                        className='BoxFullViewPopover__container__detail-group'
                      >
                        <Text component='h4' tint={100} weight={600} size={14}>
                          {groupConfigKey}
                        </Text>
                        <Text tint={70}>
                          ({data.groups[groupConfigKey].items_count_in_group}{' '}
                          items in this group)
                        </Text>
                        <div>
                          {Object.keys(data.groups[groupConfigKey].config).map(
                            (item) => {
                              let val = isSystemMetric(
                                data.groups[groupConfigKey].config[item],
                              )
                                ? formatSystemMetricName(
                                    data.groups[groupConfigKey].config[item],
                                  )
                                : data.groups[groupConfigKey].config[item];
                              val = formatValue(val);
                              return (
                                <Tooltip key={item} title={val}>
                                  <div className='BoxFullViewPopover__container__detail-group__item'>
                                    <Text
                                      size={12}
                                      className='BoxFullViewPopover__container__detail-group__item__key'
                                    >{`${item}: `}</Text>
                                    <Text size={12} tint={100}>
                                      {val}
                                    </Text>
                                  </div>
                                </Tooltip>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </ErrorBoundary>
  );
}

export default BoxFullViewPopover;
