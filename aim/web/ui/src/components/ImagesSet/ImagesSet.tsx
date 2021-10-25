import React from 'react';
import './ImageSet.scss';

const ImagesSet = ({
  data,
  title,
  imagesBlobs,
}: any): React.FunctionComponentElement<React.ReactNode> => {
  return (
    <div className='ImagesSet'>
      {Array.isArray(data) ? (
        <div className='ImagesSet__container'>
          <span className='ImagesSet__container__title'>{title}</span>
          <div className='ImagesSet__container__imagesBox'>
            {data.map(({ src, height, width, step, index }, i) => (
              <div
                key={i}
                className='ImagesSet__container__imagesBox__imageBox'
                style={{ height, width }}
              >
                <p>
                  `index=${index},step={step}`
                </p>
                <img
                  src={'data:image/png;base64, ' + imagesBlobs?.[src]}
                  alt=''
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='ImagesSet__container'>
          <p className='ImagesSet__container__title'>{title}</p>
          {Object.keys(data).map((keyName, key) => (
            <ImagesSet
              key={key}
              data={data[keyName]}
              title={keyName}
              imagesBlobs={imagesBlobs}
              // grouping={grouping}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ImagesSet);
