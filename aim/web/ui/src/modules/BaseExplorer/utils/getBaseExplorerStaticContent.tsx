import * as React from 'react';

import Illustration, {
  getDefaultIllustrationContent,
  ILLUSTRATION_TYPES,
} from 'components/Illustration';

import { StaticContentType } from '../types';

const STATIC_CONTENT_TYPES: Record<string, StaticContentType> = {
  ...ILLUSTRATION_TYPES,
  /** add additional static content types here **/
};

function getBaseExplorerStaticContent(
  type?: StaticContentType,
  getIllustrationContent: Function = getDefaultIllustrationContent,
): React.ReactNode {
  switch (type) {
    case STATIC_CONTENT_TYPES.Never_Executed:
    case STATIC_CONTENT_TYPES.Empty:
    case STATIC_CONTENT_TYPES.Insufficient_Resources:
    case STATIC_CONTENT_TYPES.Failed:
    case STATIC_CONTENT_TYPES.Empty_Bookmarks:
      return (
        <Illustration type={type} content={getIllustrationContent(type)} />
      );
    default:
      return null;
  }
}

export default getBaseExplorerStaticContent;
