import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';

import {
  IIllustrationProps,
  ILLUSTRATION_TYPES,
  ILLUSTRATION_LIST,
  getDefaultIllustrationContent,
} from '.';

import './Illustration.scss';

function Illustration({
  type = ILLUSTRATION_TYPES.Never_Executed,
  content = getDefaultIllustrationContent(type),
  image,
  className = '',
  size = 'xLarge',
  showImage = true,
}: IIllustrationProps): React.FunctionComponentElement<React.ReactNode> {
  const [imgLoaded, setImgLoaded] = React.useState(false);

  return (
    <div
      className={classNames('Illustration', {
        Illustrations__hidden: showImage && !imgLoaded,
        [className]: !!className,
      })}
    >
      <div className='Illustration__container'>
        {showImage ? (
          <div
            className={`Illustration__container__img Illustration__container__${size}__img `}
          >
            {image || (
              <img
                onLoad={() => setImgLoaded(true)}
                src={ILLUSTRATION_LIST[type]}
                alt='Illustration'
              />
            )}
          </div>
        ) : null}

        <Text
          component='p'
          className={`Illustration__container__content Illustration__container__${size}__content`}
        >
          {content}
        </Text>
      </div>
    </div>
  );
}

export default React.memo(Illustration);
