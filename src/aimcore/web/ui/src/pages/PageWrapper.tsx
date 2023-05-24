import React from 'react';

import { PathEnum } from 'config/enums/routesEnum';

import { setDocumentTitle } from 'utils/document/documentTitle';

function PageWrapper(props: {
  children: React.ReactNode;
  title: string;
  path: PathEnum;
}) {
  const { title, path, children } = props;

  React.useEffect(() => {
    if (path === PathEnum.Dashboard) {
      setDocumentTitle();
    } else if (path !== PathEnum.Run_Detail) {
      setDocumentTitle(title, true);
    }
  }, [title, path]);

  return <>{children}</>;
}

export default PageWrapper;
