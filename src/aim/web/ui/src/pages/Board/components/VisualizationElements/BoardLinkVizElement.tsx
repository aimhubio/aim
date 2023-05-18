import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { IconExternalLink } from '@tabler/icons-react';

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
        rightIcon={
          props.options.new_tab && <IconExternalLink color='#1F2227' />
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
