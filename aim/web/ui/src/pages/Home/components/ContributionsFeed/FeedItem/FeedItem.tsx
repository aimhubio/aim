import React from 'react';

function FeedItem(props: any): React.FunctionComponentElement<React.ReactNode> {
  return <div className='FeedItem'></div>;
}

export default React.memo(FeedItem);
