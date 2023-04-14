import React from 'react';

import {
  IconDotsVertical,
  IconEdit,
  IconShare2,
  IconTrash,
} from '@tabler/icons-react';
import { IconCalendarEvent } from '@tabler/icons-react';

import {
  Box,
  Button,
  Dialog,
  Icon,
  IconButton,
  ListItem,
  Popover,
  Separator,
  Text,
} from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import BoardDelete from 'pages/Boards/BoardDelete';

import {
  BoardCardContainer,
  BoardCardHeader,
  BoardCardLink,
} from './BoardCard.style';

function BoardCard({
  code,
  name,
  description,
  id,
  created_at,
  onBoardDelete,
  ...props
}: any) {
  return (
    <BoardCardContainer key={id} className='Boards__list__item'>
      <BoardCardHeader>
        <BoardCardLink to={PathEnum.Board.replace(':boardId', id)}>
          <Text as='h3' size='$5' weight='$4' color='$primary100'>
            {name}
          </Text>
        </BoardCardLink>
        <Popover
          popperProps={{
            align: 'end',
            css: {
              width: '87px',
              p: '$5 0',
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
            <Box display='flex' fd='column' gap='$4'>
              <ListItem leftNode={<Icon size='md' icon={<IconEdit />} />}>
                Edit
              </ListItem>
              <ListItem leftNode={<Icon size='md' icon={<IconShare2 />} />}>
                Share
              </ListItem>
              <Separator />
              <Dialog
                title={`Delete board ${name}?`}
                titleIcon={<IconTrash />}
                onConfirm={() => onBoardDelete(id)}
                description='Are you sure you want to delete this board?'
                trigger={
                  <ListItem
                    css={{ color: '$danger100' }}
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
        <Text size={11} color='$secondary100' weight='$2'>
          {new Date(created_at).toLocaleString()}
        </Text>
      </Box>
    </BoardCardContainer>
  );
}

BoardCard.displayName = 'BoardCard';
export default React.memo(BoardCard);
