import React from 'react';
import imagesExploreMockData from 'services/models/imagesExplore/imagesExploreMockData';

const ImageSet = React.forwardRef(function ImageSet(
  { data }: any,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  console.log(data);
  return (
    <div className='ImageSet'>
      {data?.data?.map((imageData: any, index: number) => (
        <div style={{ display: 'flex', flexDirection: 'column' }} key={index}>
          <p>{`step: ${imageData.step}, index: ${imageData.index}`}</p>
          <div className='ImageSet__imageBox'>
            <img src={imageData.src} alt='' />
          </div>
        </div>
      ))}
    </div>
  );
});

export default React.memo(ImageSet);
