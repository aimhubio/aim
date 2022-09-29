import React from 'react';

function FeedItem(props: any): React.FunctionComponentElement<React.ReactNode> {
  console.log(props.data);
  return (
    <div className='FeedItem'>
      {/* {props.info.map((item: string) => (
        <div key={item}>{item}</div>
      ))} */}
    </div>
  );
}

export default React.memo(FeedItem);
