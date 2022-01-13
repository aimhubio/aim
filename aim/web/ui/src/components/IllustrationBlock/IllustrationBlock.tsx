import React, { memo } from 'react';

import { Text } from 'components/kit';

import {
  Illustrations_List,
  IllustrationsEnum,
  Illustration_Content_Config,
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
}: IIllustrationBlockProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={`IllustrationBlock ${className}`}>
      <div className={`IllustrationBlock__${size}__img`}>
        {image || <img src={Illustrations_List[type]} alt='' />}
      </div>
      <Text component='p' className={`IllustrationBlock__${size}__title`}>
        {title}
      </Text>
      <Text component='p' className={`IllustrationBlock__${size}__content`}>
        {content || Illustration_Content_Config[page || 'runs'][type]}
      </Text>
    </div>
  );
}

export default memo(IllustrationBlock);
