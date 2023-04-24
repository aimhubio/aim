import React from 'react';

import { IconBookmark } from '@tabler/icons-react';

import { Box, Button, Text } from 'components/kit_v2';
import Breadcrumb from 'components/kit_v2/Breadcrumb';

import { PathEnum } from 'config/enums/routesEnum';
import { TopBar } from 'config/stitches/foundations/layout';

import { getItem } from 'utils/storage';

import {
  ExplorerBookmarkLink,
  ExplorerCardsWrapper,
  ExplorersContentContainer,
} from './Explorers.style';
import useExplorers from './useExplorers';
import ExplorerCard from './components/ExplorerCard';

/**
 * Explorers page
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function Explorers(): React.FunctionComponentElement<React.ReactNode> {
  const { explorers, isLoading } = useExplorers();
  function getPathFromStorage(route: PathEnum): PathEnum | string {
    const path = getItem(`${route.split('/')[2]}Url`) ?? '';
    if (path !== '' && path.startsWith(route)) {
      return path;
    }
    return route;
  }

  return (
    <Box display='flex' fd='column'>
      <TopBar jc='space-between'>
        <Breadcrumb />
        <ExplorerBookmarkLink to={PathEnum.Bookmarks}>
          <Button
            leftIcon={<IconBookmark color='#161717' />}
            horizontalSpacing='compact'
            size='xs'
            variant='ghost'
            color='secondary'
          >
            <Text>Bookmarks</Text>
          </Button>
        </ExplorerBookmarkLink>
      </TopBar>
      <ExplorersContentContainer>
        <Box display='flex' fd='column'>
          <Box>
            <Text css={{ mb: '$5' }} weight='$3' as='h3' size='$6'>
              Prompt engineering
            </Text>
            <Text>Explore and compare your prompts and generated outputs</Text>
            <ExplorerCardsWrapper>
              {Object.values(explorers.promptExplorers).map(
                (item, index: number) => (
                  <ExplorerCard
                    {...item}
                    isLoading={isLoading}
                    path={getPathFromStorage(item.path as PathEnum) as PathEnum}
                    key={index}
                  />
                ),
              )}
            </ExplorerCardsWrapper>
          </Box>
          <Box mt='$17'>
            <Text css={{ mb: '$5' }} weight='$3' as='h3' size='$6'>
              Experiment tracking
            </Text>
            <Text>
              Explorers will help you to compare 1000s of AI experiments with a
              few clicks. Explorers are the main tools that Aim is built around
            </Text>
            <ExplorerCardsWrapper>
              {Object.values(explorers.aimExplorers).map(
                (item, index: number) => (
                  <ExplorerCard
                    {...item}
                    isLoading={isLoading}
                    path={getPathFromStorage(item.path as PathEnum) as PathEnum}
                    key={index}
                  />
                ),
              )}
            </ExplorerCardsWrapper>
          </Box>
        </Box>
      </ExplorersContentContainer>
    </Box>
  );
}

export default Explorers;
