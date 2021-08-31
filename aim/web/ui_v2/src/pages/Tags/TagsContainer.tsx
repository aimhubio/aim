import useModel from 'hooks/model/useModel';
import React from 'react';
import tagsAppModel from 'services/models/tags/tagsAppModel';
import Tags from './Tags';

const tagsRequestRef = tagsAppModel.getTagsData();

function TagsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tagsData = useModel(tagsAppModel);

  React.useEffect(() => {
    tagsAppModel.initialize();
    tagsRequestRef.call();
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
