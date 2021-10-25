import React from 'react';
import imageExplorerMockData from 'services/models/imagesExplore/imagesExploreMockData';
import './ImageSet.scss';

const ImagesSet = React.forwardRef(function ImageSet(
  { data, title, imagesBlobs }: any,
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
                <img
                  // src={
                  //   imageExplorerMockData[0].images[0].values[0][0]
                  //     .blob as string
                  // }
                  src={
                    'data:image/png;base64, ' +
                    'AGIAJwCJAFAATgBHAA0ACgAaAAoAAAAAAAAADQBJAEgARABSAAAAAAAAABwAAAAAAAAAHAAIAAAAAAAAAAAAVwBmAIAASAAAAAAAAQAAAEkARABBAFQAeACcAGMAYAAYAMwAgABZAEgASACoAK4AYwC9ANQAsgD/AN8A6wAZABgAGAAYAFgAYAASAHIAbABWADYAAgDBAAwADAAMAAwATwAmAAUAfgC+AHgAkACBAIEAgQCBABEAKgBnALgAlwAfAMoA+gCXAPQAlQDhANkA+wCbAMgAJgAKAN0A/gD7APcA7wDfAL8AxwC2AH0A/wCIAMUAvgCAADkA2QB/AP8AngDlAGYA0ACeAIUAzQA1AHwAjACzAP4ARgChAAoAMQDBAFkAnwD+AH8AZABIAGEAYgDAAAUAuAD3AP0AdQDDACkAyQCgAPwA8QDhAIIAHABGAFwAsgCBAB8A/gD+AC0AlwDEACUAqwC7AOsA7wDfAGkA0gC4AGQABQBiAP8A/ADdAI0A2wDiAJ8AfwB/ADoAQACZACwAqAAyAHoAIQCmACwADADXAA4AYQDTAKQAPgDlAOkA3wC/AH8AfwBtAMMAIgAlAFEAdAD3AO8A3wC/AH8ATwD6AGEASgCJADsAXQD9APsA9wDvAN8AYwCBAJgAgQAkALQA+gD2AN8AvwB/AP8AHgAOAOAAxACQADIAXwDzAOgA7wDfAL8AfwC/ALQAcgCjAIoAswAwADAAMAAwAAQABgAyADAAXADfAPwAtwDnAAMANgBXAFIAHwAAAAAARQAXAF4AgABrAEwAAAA7AAAAAAAAAAAASQBFAE4ARACuAEIAYACC'
                  }
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
              // grouping={grouping}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default React.memo(ImagesSet);
