import { ComponentStory, ComponentMeta } from '@storybook/react';

import LinkComponent from 'components/kit_v2/Link';

import { config } from 'config/stitches';

export default {
  title: 'Kit/Inputs/Link',
  component: LinkComponent,
  argTypes: {
    color: {
      control: 'select',
      options: Object.keys((config.theme as { colors: {} }).colors).map(
        (key) => `$${key}`,
      ),
    },
    fontWeight: {
      control: 'select',
      options: Object.keys(
        (config.theme as { fontWeights: {} }).fontWeights,
      ).map((key) => `$${key}`),
    },
    fontSize: {
      control: 'select',
      options: Object.keys((config.theme as { fontSizes: {} }).fontSizes).map(
        (key) => `$${key}`,
      ),
    },
    css: {
      control: 'object',
    },
  },
} as ComponentMeta<typeof LinkComponent>;

const Template: ComponentStory<typeof LinkComponent> = (args) => (
  <>
    <LinkComponent {...args}>{args.children}</LinkComponent>
  </>
);

export const Link = Template.bind({});
export const NavLink = Template.bind({});

Link.args = {
  to: 'https://www.aimstack.io',
  children: 'External Link',
};

NavLink.args = {
  to: '/button',
  children: 'Internal Link',
};
