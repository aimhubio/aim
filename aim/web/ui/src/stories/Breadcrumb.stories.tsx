import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Box, Text } from 'components/kit_v2';
import BreadcrumbComponent, {
  BreadcrumbItem,
} from 'components/kit_v2/Breadcrumb';

export default {
  title: 'Kit/Data Display',
  component: BreadcrumbComponent,
  argTypes: {},
} as ComponentMeta<typeof BreadcrumbComponent>;

const Template: ComponentStory<typeof BreadcrumbComponent> = (args) => {
  return (
    <Box display='flex' ai='center'>
      <React.Fragment>
        <BreadcrumbItem isActive={() => false} to={'/'}>
          Explorers
        </BreadcrumbItem>
        <Text size='$3' css={{ mx: '$2' }} color='$textPrimary50'>
          {' '}
          /{' '}
        </Text>
        <BreadcrumbItem to={'/'}>Bookmarks</BreadcrumbItem>
      </React.Fragment>
    </Box>
  );
};
export const Breadcrumb = Template.bind({});

Breadcrumb.args = {};
