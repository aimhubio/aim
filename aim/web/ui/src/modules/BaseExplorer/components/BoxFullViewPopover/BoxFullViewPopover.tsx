import moment from 'moment';
import _ from 'lodash-es';
import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Dialog, Link } from '@material-ui/core';

import { Badge, Button, Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';

import { ITagProps } from 'types/pages/tags/Tags';

import { processDurationTime } from 'utils/processDurationTime';
import { formatValue } from 'utils/formatValue';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';

import './BoxFullViewPopover.scss';

function BoxFullViewPopover({ onClose, element, sequence, groupInfo }: any) {
  const data = React.useMemo(() => {
    const runData = element.props.data.run;
    const sequenceData = element.props.data[sequence];
    return {
      runInfo: [
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
          icon: 'calendar',
          value: `${moment(runData?.creation_time * 1000).format(
            'DD MMMM YYYY HH:mm:ss',
          )}`,
        },
        {
          icon: 'time',
          value: processDurationTime(
            runData?.creation_time * 1000,
            runData?.end_time ? runData?.end_time * 1000 : Date.now(),
          ),
        },
        {
          icon: 'tags',
          value: runData.tags.length ? (
            <div className='BoxFullViewPopover__container__detail-item__tags ScrollBar__hidden'>
              {runData.tags.map((tag: ITagProps) => (
                <Badge
                  size='xSmall'
                  key={tag.name}
                  label={tag.name}
                  color={tag.color || undefined}
                />
              ))}
            </div>
          ) : (
            'No attached tags'
          ),
        },
      ],
      sequence: [
        {
          label: 'Name',
          value: sequenceData.name,
        },
        {
          label: 'Context',
          value: (
            <Badge
              className='BoxFullViewPopover__container__detail-item__badge'
              monospace
              size='xSmall'
              label={formatValue(sequenceData.context) || 'Empty Context'}
            />
          ),
        },
        {
          label: 'Step',
          value: element.props.data.step,
        },
      ],
      groups: groupInfo,
    };
  }, [element, sequence, groupInfo]);

  return (
    <ErrorBoundary>
      <Dialog onClose={onClose} className='BoxFullViewPopover' open>
        <div className='BoxFullViewPopover__container'>
          <div className='BoxFullViewPopover__container__box'>{element}</div>
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
                Run Info
              </Text>
              {data.runInfo.map((item: any, index: number) => (
                <div
                  key={index}
                  className='BoxFullViewPopover__container__detail-item'
                >
                  <Icon name={item.icon} />
                  <Text tint={70}>{item.value}</Text>
                </div>
              ))}
            </div>
            <div className='BoxFullViewPopover__container__detail-section'>
              <Text weight={600} size={18} tint={100} component='h3'>
                {sequence}
              </Text>
              {data.sequence.map((item: any, index: number) => (
                <div key={index}>
                  <Text
                    className='BoxFullViewPopover__container__detail-item__withSpace'
                    tint={100}
                  >
                    {item.label}:
                  </Text>
                  <Text tint={70}>{item.value}</Text>
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
                        className='BoxFullViewPopover__container__detail-groupItem'
                      >
                        <Text tint={100} weight={600} size={14}>
                          {groupConfigKey}
                        </Text>
                        {Object.keys(data.groups[groupConfigKey].config).map(
                          (item) => {
                            let val = isSystemMetric(
                              data.groups[groupConfigKey].config[item],
                            )
                              ? formatSystemMetricName(
                                  data.groups[groupConfigKey].config[item],
                                )
                              : data.groups[groupConfigKey].config[item];
                            return (
                              <div key={item}>
                                <Text size={12} tint={100}>{`${item}: `}</Text>
                                <Text size={12}>{formatValue(val)}</Text>
                              </div>
                            );
                          },
                        )}
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
