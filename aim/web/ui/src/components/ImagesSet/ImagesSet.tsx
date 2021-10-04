import React from 'react';
import imagesExploreMockData from 'services/models/imagesExplore/imagesExploreMockData';

const ImagesSet = React.forwardRef(function ImageSet(
  { data, title }: any,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='ImagesSet'>
      {Array.isArray(data) ? (
        <div className='ImagesSet__imagesBox'>
          <span>{title}</span>
          <div>
            {data.map(({ src }, index) => (
              <img key={index} src={src} alt='' />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p>{title}</p>
          {Object.keys(data).map((keyName, key) => (
            <ImagesSet
              key={key}
              data={data[keyName]}
              title={keyName}
              // grouping={grouping}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default React.memo(ImagesSet);
