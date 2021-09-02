import React, { memo } from 'react';
import './EmptyComponent.scss';
import noData from '../../assets/icons/noData.png';

function EmptyComponent({
  title,
  content = 'No Data',
  img,
  className = '',
  size = 'small',
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={`EmptyComponent ${className}`}>
      <div className={`EmptyComponent__${size}__img`}>
        {img || <img src={noData} alt='' />}
      </div>
      <p className={`EmptyComponent__${size}__title`}>{title}</p>
      <p className={`EmptyComponent__${size}__content`}>{content}</p>
    </div>
  );
}

export default memo(EmptyComponent);
