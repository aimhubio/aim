import React from 'react';

import { Box, Link, Text } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import { AppCardContainer, AppCardHeader } from '../Apps.style';

function AppCard({ name, description }: any) {
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
      <Box mt='$5' flex='1'>
        <Text
          ellipsis
          color={description ? '$textPrimary' : '$textPrimary50'}
          as='p'
        >
          {description || 'No description yet'}
        </Text>
      </Box>
    </AppCardContainer>
  );
}

AppCard.displayName = 'AppCard';

export default React.memo(AppCard);
