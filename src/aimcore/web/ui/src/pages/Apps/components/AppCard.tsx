import React from 'react';

import { IconUserCircle } from '@tabler/icons-react';

import { Badge, Box, Icon, Link, Text, Tooltip } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import { AppCardContainer, AppCardHeader } from '../Apps.style';

function AppCard({ name, description, author, category }: any) {
  return (
    <AppCardContainer key={name}>
      <AppCardHeader>
        <Link
          css={{ flex: 1 }}
          fontWeight='$4'
          fontSize='$6'
          ellipsis
          title={name}
          to={PathEnum.App.replace(':appName', name)}
        >
          {name}
        </Link>
      </AppCardHeader>
      <Box display='flex' flex={1} jc='space-between' fd='column'>
        <Tooltip
          content={description ?? null}
          contentProps={{ side: 'bottom' }}
        >
          <Box mt='$5' flex='1'>
            <Text
              ellipsis
              color={description ? '$textPrimary' : '$textPrimary50'}
              as='p'
            >
              {description || 'No description yet'}
            </Text>
          </Box>
        </Tooltip>
        <Box display='flex' ai='center' jc='space-between'>
          <Box display='flex' ai='center'>
            <Icon
              size='md'
              css={{ mr: '$3' }}
              color='$secondary100'
              icon={<IconUserCircle />}
            />
            <Text color='$secondary100' weight='$2'>
              {author ?? 'Unknown'}
            </Text>
          </Box>
          {category && <Badge size='sm' label={category} />}
        </Box>
      </Box>
    </AppCardContainer>
  );
}

AppCard.displayName = 'AppCard';

export default React.memo(AppCard);
