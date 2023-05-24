import React from 'react';
import classNames from 'classnames';
import { NavLink, useRouteMatch } from 'react-router-dom';

import { Text, Button, Icon } from 'components/kit';

import { IExperimentOverviewSidebarProps } from '.';

import './ExperimentOverviewSidebar.scss';

const CLOSED_DESCRIPTION_BOX_MAX_HEIGHT = 72;
const SIDEBAR_TOP_SPACE = 40;

function ExperimentOverviewSidebar({
  sidebarRef,
  overviewSectionRef,
  setContainerHeight,
  overviewSectionContentRef,
  description,
}: IExperimentOverviewSidebarProps): React.FunctionComponentElement<React.ReactNode> {
  const { url } = useRouteMatch();
  const descriptionBoxRef = React.useRef<HTMLElement | any>(null);
  const [seeMoreDescription, setSeeMoreDescription] =
    React.useState<boolean>(false);
  const [descriptionHeight, setDescriptionHeight] = React.useState<number>(0);

  function onContainerScroll(e: any) {
    overviewSectionRef?.current?.scrollTo(0, e.target.scrollTop);
  }

  function onSeeMoreButtonClick() {
    setSeeMoreDescription(!seeMoreDescription);
  }

  React.useEffect(() => {
    setDescriptionHeight(descriptionBoxRef?.current?.offsetHeight);
  }, [descriptionBoxRef?.current?.offsetHeight, seeMoreDescription]);

  React.useEffect(() => {
    if (
      overviewSectionContentRef?.current?.offsetHeight >
      sidebarRef?.current?.childNodes[0].offsetHeight
    ) {
      setContainerHeight('100%');
    } else {
      setContainerHeight(
        sidebarRef?.current?.childNodes[0].offsetHeight + SIDEBAR_TOP_SPACE,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptionHeight]);

  return (
    <div
      className='ExperimentOverviewSidebar ScrollBar__hidden'
      ref={sidebarRef}
      onScroll={onContainerScroll}
    >
      <div className='ExperimentOverviewSidebar__wrapper'>
        <div className='ExperimentOverviewSidebar__section ExperimentOverviewSidebar__section__descriptionBox'>
          <div className='ExperimentOverviewSidebar__section__descriptionBox__header'>
            <Text weight={600} size={18} tint={100} component='h3'>
              Description
            </Text>
            <NavLink to={`${url.split('/').slice(0, -1).join('/')}/settings`}>
              <Button withOnlyIcon size='small' color='secondary'>
                <Icon name='edit'></Icon>
              </Button>
            </NavLink>
          </div>

          <div
            className={classNames(
              'ExperimentOverviewSidebar__section__descriptionBox__description',
              { showAll: seeMoreDescription },
              {
                hasMore:
                  descriptionHeight >= CLOSED_DESCRIPTION_BOX_MAX_HEIGHT &&
                  !seeMoreDescription,
              },
            )}
            ref={descriptionBoxRef}
          >
            <Text tint={70}>{description || 'No description'}</Text>
          </div>
          {descriptionHeight >= CLOSED_DESCRIPTION_BOX_MAX_HEIGHT && (
            <div
              className='ExperimentOverviewSidebar__section__descriptionBox__seeMoreButtonBox'
              onClick={onSeeMoreButtonClick}
            >
              <Text size={12} weight={600}>
                {seeMoreDescription ? 'See less' : 'See more'}
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ExperimentOverviewSidebar;
