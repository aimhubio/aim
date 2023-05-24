import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { IconLayout2, IconExternalLink } from '@tabler/icons-react';

import { Link, Button, Text } from 'components/kit_v2';

function BoardLinkVizElement(props: any) {
  const boardId = props.data;
  const { path } = useRouteMatch();

  return (
    <Link
      css={{
        display: 'flex',
        color: '$textPrimary',
        textDecoration: 'underline',
        textDecorationColor: '$textPrimary50',
      }}
      to={path.replace(':boardId', boardId)}
      target={props.options.new_tab ? '_blank' : undefined}
    >
      <Button
        leftIcon={<IconLayout2 color='#45484D' />}
        rightIcon={
          props.options.new_tab && <IconExternalLink color='#45484D' />
        }
        horizontalSpacing='compact'
        size='md'
        variant='ghost'
        color='secondary'
      >
        <Text>{props.options.text}</Text>
      </Button>
    </Link>
  );
}
export default BoardLinkVizElement;
