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
} from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import { useCopy } from 'hooks/useCopy';

import { ReportCardContainer, ReportCardHeader } from './ReportCard.style';

function ReportCard({
  code,
  name,
  description,
  id,
  created_at,
  onReportDelete,
  ...props
}: any) {
  const { onCopy, copied } = useCopy(id);
  return (
    <ReportCardContainer key={id}>
      <ReportCardHeader>
        <Link
          ellipsis
          css={{ flex: 1 }}
          fontWeight='$4'
          fontSize='$6'
          title={name}
          to={PathEnum.Report.replace(':reportId', id)}
        >
          {name}
        </Link>
        <Popover
          popperProps={{ align: 'end', css: { width: '108px', p: '$4 0' } }}
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
                  to={`${PathEnum.Reports}/${id}/edit`}
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
                title='Delete report'
                titleIcon={<IconTrash />}
                onConfirm={() => onReportDelete(id)}
                description='Are you sure you want to delete this report?'
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
      </ReportCardHeader>
      <Box mb='$5' mt='$5' flex='1'>
        <Text
          ellipsis
          color={description ? '$textPrimary' : '$textPrimary50'}
          as='p'
        >
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
    </ReportCardContainer>
  );
}

ReportCard.displayName = 'ReportCard';
export default React.memo(ReportCard);
