import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  IconClipboard,
  IconClipboardCheck,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { IconCalendarEvent } from '@tabler/icons-react';

import {
  Box,
  Dialog,
  Icon,
  IconButton,
  Link,
  ListItem,
  Popover,
  Separator,
  Text,
  Tooltip,
} from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import { useCopy } from 'hooks/useCopy';

import { BoardCardContainer, BoardCardHeader } from './BoardCard.style';

function BoardCard({
  code,
  name,
  description,
  id,
  created_at,
  onBoardDelete,
  ...props
}: any) {
  const getBaseUrl = () => {
    return `${window.location.protocol}//${window.location.host}`;
  };

  const baseUrl = getBaseUrl();
  const fullPath = `${baseUrl}${PathEnum.Boards}/${id}`;
  const { onCopy, copied } = useCopy(fullPath);

  return (
    <BoardCardContainer key={id}>
      <BoardCardHeader>
        <Link
          css={{ flex: 1 }}
          fontWeight='$4'
          fontSize='$6'
          ellipsis
          title={name}
          to={PathEnum.Board.replace(':boardId', id)}
        >
          {name}
        </Link>
        <Popover
          popperProps={{
            align: 'end',
            css: {
              width: '108px',
              p: '$4 0',
            },
          }}
          trigger={
            <IconButton
              variant='ghost'
              color='secondary'
              size='md'
              icon={<IconDotsVertical />}
            />
          }
          content={
            <Box display='flex' fd='column'>
              <Box p='0 $4'>
                <NavLink
                  style={{ textDecoration: 'none' }}
                  to={`${PathEnum.Boards}/${id}/edit`}
                >
                  <ListItem
                    size='lg'
                    leftNode={<Icon size='md' icon={<IconEdit />} />}
                  >
                    Edit
                  </ListItem>
                </NavLink>
                <ListItem
                  size='lg'
                  onClick={onCopy}
                  leftNode={
                    <Icon
                      size='md'
                      icon={copied ? <IconClipboardCheck /> : <IconClipboard />}
                    />
                  }
                >
                  {copied ? 'Copied' : 'Copy Url'}
                </ListItem>
              </Box>
              <Separator margin={'$4'} />
              <Dialog
                title='Delete board'
                titleIcon={<IconTrash />}
                onConfirm={() => onBoardDelete(id)}
                description='Are you sure you want to delete this board?'
                trigger={
                  <ListItem
                    size='lg'
                    css={{ color: '$danger100', mx: '$4' }}
                    leftNode={
                      <Icon color='$danger100' size='md' icon={<IconTrash />} />
                    }
                  >
                    Delete
                  </ListItem>
                }
              />
            </Box>
          }
        />
      </BoardCardHeader>
      <Box mt='$5' flex='1'>
        <Text color={description ? '$textPrimary' : '$textPrimary50'} as='p'>
          {description || 'No description yet'}
        </Text>
      </Box>
      <Box display='flex' ai='center'>
        <Icon
          size='md'
          css={{ mr: '$3' }}
          color='$secondary100'
          icon={<IconCalendarEvent />}
        />
        <Text color='$secondary100' weight='$2'>
          {new Date(created_at).toLocaleString()}
        </Text>
      </Box>
    </BoardCardContainer>
  );
}

BoardCard.displayName = 'BoardCard';
export default React.memo(BoardCard);
