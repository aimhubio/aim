import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';
import { ITextProps } from 'components/kit/Text';

import {
  IIllustrationProps,
  ILLUSTRATION_TYPES,
  ILLUSTRATION_LIST,
  getDefaultIllustrationContent,
  IllustrationSizeType,
} from '.';

import './Illustration.scss';

const CONTENT_PROPS: Record<IllustrationSizeType, ITextProps> = {
  small: {
    size: 12,
  },
  medium: {
    size: 14,
  },
  large: {
    size: 16,
  },
  xLarge: {
    size: 18,
  },
};

function Illustration({
  type = ILLUSTRATION_TYPES.Never_Executed,
  content = getDefaultIllustrationContent(type),
  image,
  className = '',
  size = 'xLarge',
  showImage = true,
  children,
}: IIllustrationProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={classNames('Illustration', { [className]: !!className })}>
      <div className='Illustration__container'>
        {showImage ? (
          <div
            className={classNames('Illustration__container__img', {
              [`Illustration__container__img__${size}`]: true,
            })}
          >
            {image || ILLUSTRATION_LIST[type]}
          </div>
        ) : null}
        <Text
          component='p'
          className='Illustration__container__content'
          {...CONTENT_PROPS[size]}
        >
          {content}
        </Text>
        {children}
      </div>
    </div>
  );
}

export default React.memo(Illustration);
