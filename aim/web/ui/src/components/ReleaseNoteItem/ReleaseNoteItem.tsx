import React from 'react';

import { Text } from 'components/kit';

import './ReleaseNoteItem.scss';

function ReleaseNoteItem({
  info,
  tagName,
  url,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <a href={url} target='_blank' className='ReleaseNoteItem' rel='noreferrer'>
      <Text component='p' size={12}>
        <span className='ReleaseNoteItem__tagName'>{tagName}</span>
        {info}
      </Text>
    </a>
  );
}

export default React.memo(ReleaseNoteItem);
