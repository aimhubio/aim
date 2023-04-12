import { ComponentStory, ComponentMeta } from '@storybook/react';

import BreadcrumbComponent from 'components/kit_v2/Breadcrumb';

export default {
  title: 'Kit/Data Display',
  component: BreadcrumbComponent,
  argTypes: {},
} as ComponentMeta<typeof BreadcrumbComponent>;

const Template: ComponentStory<typeof BreadcrumbComponent> = (args) => (
  <BreadcrumbComponent />
);

export const Breadcrumb = Template.bind({});

Breadcrumb.args = {};
