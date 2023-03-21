import * as React from 'react';

function TextList(props: any) {
  const data = props.data.map((text: any) => ({
    ...text,
    ...text.data,
    ...text.texts,
    ...text.record,
  }));

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
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
              whiteSpace: 'normal',
            }}
          >
            {item.data}
          </pre>
        </div>
      ))}
    </div>
  );
}

export default TextList;
