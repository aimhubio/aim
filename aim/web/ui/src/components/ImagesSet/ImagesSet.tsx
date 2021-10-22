import React from 'react';
import './ImageSet.scss';

const ImagesSet = React.forwardRef(function ImageSet(
  { data, title }: any,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='ImagesSet'>
      {Array.isArray(data) ? (
        <div className='ImagesSet__container'>
          <span className='ImagesSet__container__title'>{title}</span>
          <div className='ImagesSet__container__imagesBox'>
            {data.map(({ src }, index) => (
              <div
                key={index}
                className='ImagesSet__container__imagesBox__imageBox'
              >
                {/* <img src={src} alt='' /> */}
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
              // grouping={grouping}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default React.memo(ImagesSet);
