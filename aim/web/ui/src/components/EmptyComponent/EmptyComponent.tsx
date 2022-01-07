import React, { memo } from 'react';

import emptyBookmarks from 'assets/emptyBookmarks.svg';
import emptySearch from 'assets/emptySearch.svg';
import exploreData from 'assets/exploreData.svg';
import wrongSearch from 'assets/wrongSearch.svg';

import { Text } from 'components/kit';

import { IEmptyComponentProps } from 'types/components/EmptyComponent/EmptyComponent';

import './EmptyComponent.scss';

const imageList = {
  emptyBookmarks,
  emptySearch,
  exploreData,
  wrongSearch,
};

function EmptyComponent({
  title,
  content = 'No Data',
  img,
  className = '',
  size = 'small',
  imageName = 'exploreData',
}: IEmptyComponentProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={`EmptyComponent ${className}`}>
      <div className={`EmptyComponent__${size}__img`}>
        {img || <img src={imageList[imageName]} alt='' />}
      </div>
      <Text component='p' className={`EmptyComponent__${size}__title`}>
        {title}
      </Text>
      <Text component='p' className={`EmptyComponent__${size}__content`}>
        {content}
      </Text>
    </div>
  );
}

export default memo(EmptyComponent);
