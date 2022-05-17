import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import getDocumentTitle from 'utils/getDocumentTitle';

function PageWrapper(props: { children: React.ReactNode }): JSX.Element {
  const { pathname } = useLocation();
  const params = useParams<{ [key: string]: string }>();

  React.useEffect(() => {
    document.title = getDocumentTitle(pathname, params);
  }, [pathname, params]);

  return <>{props.children}</>;
}

export default PageWrapper;
