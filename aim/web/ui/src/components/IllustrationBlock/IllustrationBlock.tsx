import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';

import {
  IllustrationsEnum,
  Illustration_Title_Config,
  Illustration_Content_Config,
  Illustrations_List,
} from 'config/illustrationConfig/illustrationConfig';

import { IIllustrationBlockProps } from 'types/components/IllustrationBlock/IllustrationBlock';

import './IllustrationBlock.scss';

function IllustrationBlock({
  title,
  content,
  image,
  page = 'metrics',
  type = IllustrationsEnum.ExploreData,
  className = '',
  size = 'small',
  showImage = true,
}: IIllustrationBlockProps): React.FunctionComponentElement<React.ReactNode> {
  const [imgLoaded, setImgLoaded] = React.useState(false);

  function onImgLoad() {
    setImgLoaded(true);
  }

  return (
    <div
      className={classNames(`IllustrationBlock ${className}`, {
        IllustrationBlock__hidden: showImage && !imgLoaded,
      })}
    >
      <div className='IllustrationBlock__container'>
        {showImage ? (
          <div className={`IllustrationBlock__${size}__img`}>
            {image || (
              <img
                onLoad={onImgLoad}
                src={Illustrations_List[type]}
                alt='Illustration'
              />
            )}
          </div>
        ) : null}

        <Text
          component='p'
          className={`IllustrationBlock__title IllustrationBlock__${size}__title`}
        >
          {title || Illustration_Title_Config[page][type]}
        </Text>
      </div>

      {content ? (
        <Text
          component='p'
          className={`IllustrationBlock__content IllustrationBlock__${size}__content`}
        >
          {content}
        </Text>
      ) : (
        Illustration_Content_Config[page][type]
      )}
    </div>
  );
}

export default React.memo(IllustrationBlock);
