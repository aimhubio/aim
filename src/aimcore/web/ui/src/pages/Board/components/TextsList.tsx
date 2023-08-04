import * as React from 'react';

function TextsList(props: any) {
  const data = props.data.map((text: any) => ({
    ...text,
    ...text.data,
    ...text.texts,
    ...text.record,
  }));

  return (
    <div
      className='TextsList'
      style={{
        height: '100%',
        overflow: 'auto',
        minHeight: 40,
        maxHeight: 100,
      }}
    >
      {data.map((item: any, i: number) => (
        <div
          key={i}
          style={{
            margin: '5px',
            flex: 1,
          }}
        >
          <pre
            style={{
              padding: '6px 8px',
              backgroundColor: '#e8eaee',
              borderRadius: 4,
              color: item.color,
            }}
          >
            {item.data}
          </pre>
        </div>
      ))}
    </div>
  );
}

export default TextsList;
