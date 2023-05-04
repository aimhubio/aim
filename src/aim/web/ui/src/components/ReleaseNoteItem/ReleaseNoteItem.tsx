import React from 'react';

import { Text } from 'components/kit';

import { IReleaseNoteItemProps } from './ReleaseNoteItem.d';

import './ReleaseNoteItem.scss';

function ReleaseNoteItem({
  info,
  tagName,
  ...rest
}: IReleaseNoteItemProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <a target='_blank' className='ReleaseNoteItem' rel='noreferrer' {...rest}>
      <Text component='p' size={12}>
        <span className='ReleaseNoteItem__tagName'>{tagName}</span> - {info}
      </Text>
    </a>
  );
}

export default React.memo(ReleaseNoteItem);
