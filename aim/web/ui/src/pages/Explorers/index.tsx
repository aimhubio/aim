import React from 'react';

import { Box, Text } from 'components/kit_v2';
import StatisticsCard from 'components/StatisticsCard';

import { PathEnum } from 'config/enums/routesEnum';

import { useProjectStatistics } from 'pages/Dashboard/components/ProjectStatistics';
import BookmarksContainer from 'pages/Bookmarks/BookmarksContainer';

import { getItem } from 'utils/storage';

import { ExplorersContainer } from './Explorers.style';

/**
 * Explorers page
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function Explorers(): React.FunctionComponentElement<React.ReactNode> {
  const {
    hoveredState,
    statisticsMap,
    projectParamsStore,
    onMouseOver,
    onMouseLeave,
  } = useProjectStatistics();

  function getPathFromStorage(route: PathEnum): PathEnum | string {
    const path = getItem(`${route.split('/')[2]}Url`) ?? '';
    if (path !== '' && path.startsWith(route)) {
      return path;
    }
    return route;
  }

  return (
    <Box>
      <Text
        css={{ p: '$5 $11', borderBottom: '1px solid $secondary30' }}
        size='$4'
        as='h1'
        weight='$3'
        textTransform='uppercase'
      >
        Explorers
      </Text>
      <ExplorersContainer>
        {Object.values(statisticsMap).map(
          ({ label, icon, count, iconBgColor, navLink, badge }) => (
            <StatisticsCard
              key={label}
              badge={badge}
              label={label}
              icon={icon}
              count={count}
              navLink={getPathFromStorage(navLink as PathEnum)}
              iconBgColor={iconBgColor}
              onMouseOver={onMouseOver}
              onMouseLeave={onMouseLeave}
              highlighted={
                !!navLink &&
                hoveredState.source === 'card' &&
                hoveredState.id === label
              }
              outlined={hoveredState.id === label}
              isLoading={projectParamsStore.loading}
            />
          ),
        )}
      </ExplorersContainer>
      <BookmarksContainer />
    </Box>
  );
}

export default Explorers;
