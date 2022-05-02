import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import moment from 'moment';

import { Divider } from '@material-ui/core';

import { Badge, Icon, Text } from 'components/kit';

import { processDurationTime } from 'utils/processDurationTime';

import { IRunOverviewSidebarProps } from './RunOverviewSidebar.d';

import './RunOverviewSidebar.scss';

function RunOverviewSidebar({
  info,
  traces,
  runHash,
}: IRunOverviewSidebarProps) {
  const { url } = useRouteMatch();

  const insightsList = React.useMemo(() => {
    const path = url.split('/').slice(0, -1).join('/');
    const systemMetricsLength: number =
      traces.metric.filter((m) => m.name.startsWith('__system__')).length || 0;
    return [
      {
        name: 'Notes',
        path: `${path}/notes`,
        value: info.notes || 0,
      },
      {
        name: 'Metrics',
        path: `${path}/metrics`,
        value: traces?.metric?.length - systemMetricsLength || 0,
      },
      {
        name: 'System',
        path: `${path}/system`,
        value: systemMetricsLength,
      },
      {
        name: 'Distributions',
        path: `${path}/distributions`,
        value: traces?.distributions?.length || 0,
      },
      {
        name: 'Images',
        path: `${path}/images`,
        value: traces?.images?.length || 0,
      },
      {
        name: 'Audios',
        path: `${path}/audios`,
        value: traces?.audios?.length || 0,
      },
      {
        name: 'Texts',
        path: `${path}/texts`,
        value: traces?.texts?.length || 0,
      },
      {
        name: 'Figures',
        path: `${path}/figures`,
        value: traces?.figures?.length || 0,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traces]);

  return (
    <div className='RunOverviewSidebar'>
      <div className='RunOverviewSidebar__section RunOverviewSidebar__section__info'>
        <Text weight={600} size={18} tint={100} component='h3'>
          Information
        </Text>
        <div>
          <Icon name='calendar' />
          <Text tint={70}>
            {`${moment(info?.creation_time * 1000).format('DD MMMM YYYY')}`}
          </Text>
        </div>
        <div>
          <Icon name='time' />
          <Text tint={70}>
            {`${moment(info?.creation_time * 1000).format('HH:MM A')}`}
          </Text>
        </div>
        <div>
          <Icon name='duration' />
          <Text tint={70}>
            {processDurationTime(
              info?.creation_time * 1000,
              info?.end_time ? info?.end_time * 1000 : Date.now(),
            )}
          </Text>
        </div>
        <div>
          <Icon name='hash' />
          <Text tint={70}>{runHash}</Text>
        </div>
      </div>
      {info.tags.length ? (
        <div className='RunOverviewSidebar__section RunOverviewSidebar__section__tags'>
          <Text weight={600} size={18} tint={100} component='h3'>
            Tags{' '}
            <Text component='span' tint={70} weight={400} size={18}>
              ({info.tags.length})
            </Text>
          </Text>
          <div className='RunOverviewSidebar__section__tags-list ScrollBar__hidden'>
            {info.tags.map((tag) => (
              <Badge color={tag.color} label={tag.name} key={tag.name} />
            ))}
          </div>
        </div>
      ) : null}
      <Divider className='RunOverviewSidebar__section__Divider' />
      <div className='RunOverviewSidebar__section RunOverviewSidebar__section__insights'>
        <Text weight={600} size={18} tint={100} component='h3'>
          Insights
        </Text>
        <div>
          {insightsList.map(({ name, path, value }) => (
            <NavLink
              className='RunOverviewSidebar__NavLink'
              key={path}
              to={path}
            >
              <Text size={14}>{name}</Text>
              <Text tint={70} size={14}>
                {value}
              </Text>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(RunOverviewSidebar);
