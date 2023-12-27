import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';

import { Divider } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import { processDurationTime } from 'utils/processDurationTime';

import { IRunOverviewSidebarProps } from './RunOverviewSidebar.d';

import './RunOverviewSidebar.scss';

const CLOSED_DESCRIPTION_BOX_MAX_HEIGHT = 72;
const SIDEBAR_TOP_SPACE = 40;

function RunOverviewSidebar({
  info,
  traces,
  runHash,
  sidebarRef,
  overviewSectionRef,
  overviewSectionContentRef,
  setContainerHeight,
}: IRunOverviewSidebarProps) {
  const { url } = useRouteMatch();
  const descriptionBoxRef = React.useRef<HTMLElement | any>(null);
  const [seeMoreDescription, setSeeMoreDescription] =
    React.useState<boolean>(false);
  const [descriptionHeight, setDescriptionHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (
      overviewSectionContentRef?.current?.offsetHeight >
      sidebarRef?.current?.childNodes[0].offsetHeight
    ) {
      setContainerHeight(overviewSectionContentRef?.current?.offsetHeight);
    } else {
      setContainerHeight(
        sidebarRef?.current?.childNodes[0].offsetHeight + SIDEBAR_TOP_SPACE,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptionHeight]);

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

  function onContainerScroll(e: any) {
    overviewSectionRef?.current?.scrollTo(0, e.target.scrollTop);
  }

  React.useEffect(() => {
    setDescriptionHeight(descriptionBoxRef?.current?.offsetHeight);
  }, [descriptionBoxRef?.current?.offsetHeight, seeMoreDescription]);

  function onSeeMoreButtonClick() {
    setSeeMoreDescription(!seeMoreDescription);
  }

  return (
    <div
      className='RunOverviewSidebar ScrollBar__hidden'
      ref={sidebarRef}
      onScroll={onContainerScroll}
    >
      <div className='RunOverviewSidebar__wrapper'>
        <div className='RunOverviewSidebar__section RunOverviewSidebar__section__info'>
          <Text weight={600} size={18} tint={100} component='h3'>
            Information
          </Text>
          <div className='RunOverviewSidebar__section__info__listItem'>
            <Icon name='calendar' />
            <Text tint={70}>
              {`${moment(info?.creation_time * 1000).format('DD MMMM YYYY')}`}
            </Text>
          </div>
          <div className='RunOverviewSidebar__section__info__listItem'>
            <Icon name='time' />
            <Text tint={70}>
              {`${moment(info?.creation_time * 1000).format('HH:MM A')}`}
            </Text>
          </div>
          <div className='RunOverviewSidebar__section__info__listItem'>
            <Icon name='duration' />
            <Text tint={70}>
              {processDurationTime(
                info?.creation_time * 1000,
                info?.end_time ? info?.end_time * 1000 : Date.now(),
              )}
            </Text>
          </div>
          <div className='RunOverviewSidebar__section__info__listItem runHashListItem'>
            <div className='runHashListItem__hashWrapper'>
              <Icon name='hash' />
              <Text tint={70}>{runHash}</Text>
            </div>
            <CopyToClipBoard
              className='RunOverviewSidebar__section__info__listItem__copyRunHashButton'
              iconSize='xs'
              copyContent={runHash}
            />
          </div>
        </div>
        <div className='RunOverviewSidebar__section RunOverviewSidebar__section__tags'>
          <AttachedTagsList
            runHash={runHash}
            initialTags={info.tags}
            addTagButtonSize='small'
            onTagsChange={runDetailAppModel.editTags}
          />
        </div>
        <Divider className='RunOverviewSidebar__section__Divider' />
        <div className='RunOverviewSidebar__section RunOverviewSidebar__section__descriptionBox'>
          <div className='RunOverviewSidebar__section__descriptionBox__header'>
            <Text weight={600} size={18} tint={100} component='h3'>
              Description
            </Text>
            <NavLink to={`${url.split('/').slice(0, -1).join('/')}/settings`}>
              <Button withOnlyIcon size='small' color='secondary'>
                <Icon name='edit' />
              </Button>
            </NavLink>
          </div>

          <div
            className={classNames(
              'RunOverviewSidebar__section__descriptionBox__description',
              { showAll: seeMoreDescription },
              {
                hasMore:
                  descriptionHeight >= CLOSED_DESCRIPTION_BOX_MAX_HEIGHT &&
                  !seeMoreDescription,
              },
            )}
            ref={descriptionBoxRef}
          >
            <Text tint={70}>{info?.description || 'No description'}</Text>
          </div>
          {descriptionHeight >= CLOSED_DESCRIPTION_BOX_MAX_HEIGHT && (
            <div
              className='RunOverviewSidebar__section__descriptionBox__seeMoreButtonBox'
              onClick={onSeeMoreButtonClick}
            >
              <Text size={12} weight={600}>
                {seeMoreDescription ? 'See less' : 'See more'}
              </Text>
            </div>
          )}
        </div>
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
    </div>
  );
}

export default React.memo(RunOverviewSidebar);
