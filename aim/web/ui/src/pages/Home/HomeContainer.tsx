import React from 'react';

import Home from './Home';
import homeAppModel from 'services/models/home/homeAppModel';
import useModel from 'hooks/model/useModel';

function HomeContainer(): React.FunctionComponentElement<React.ReactNode> {
  const activityRequestRef = React.useRef(homeAppModel.getActivityData());
  const homeData = useModel(homeAppModel);

  React.useEffect(() => {
    homeAppModel.initialize();
    activityRequestRef.current.call();
    return () => {
      activityRequestRef.current.abort();
    };
  }, []);

  return <Home activityData={homeData.activityData} />;
}
export default HomeContainer;
