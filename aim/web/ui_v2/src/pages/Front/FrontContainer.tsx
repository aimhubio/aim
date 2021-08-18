import React from 'react';

import Front from './Front';
import frontAppModel from 'services/models/front/frontAppModel';
import useModel from 'hooks/model/useModel';

function FrontContainer(): React.FunctionComponentElement<React.ReactNode> {
  const activityRequestRef = React.useRef(frontAppModel.getActivityData());
  const frontsData = useModel(frontAppModel);

  React.useEffect(() => {
    frontAppModel.initialize();
    activityRequestRef.current.call();
    return () => {
      activityRequestRef.current.abort();
    };
  }, []);

  return <Front activityData={frontsData.activityData} />;
}
export default FrontContainer;
