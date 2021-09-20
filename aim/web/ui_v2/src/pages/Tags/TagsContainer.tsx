import React from 'react';
import useModel from 'hooks/model/useModel';
import tagsAppModel from 'services/models/tags/tagsAppModel';

import Tags from './Tags';
import * as analytics from 'services/analytics';

const tagsRequestRef = tagsAppModel.getTagsData();

function TagsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tagsData = useModel(tagsAppModel);

  React.useEffect(() => {
    tagsAppModel.initialize();
    tagsRequestRef.call();
    analytics.pageView('[Tags]');
  }, []);
  return (
    <Tags
      tagsListData={tagsData?.tagsList}
      isTagsDataLoading={tagsData?.isTagsDataLoading}
      tagInfo={tagsData?.tagInfo}
      tagRuns={tagsData?.tagRuns}
      onNotificationDelete={tagsAppModel.onNotificationDelete}
      notifyData={tagsData?.notifyData}
      isRunsDataLoading={tagsData?.isRunsDataLoading}
      isTagInfoDataLoading={tagsData?.isTagInfoDataLoading}
    />
  );
}

export default TagsContainer;
