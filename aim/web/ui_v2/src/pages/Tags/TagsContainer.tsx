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

  return <Tags tagsList={tagsData?.tagsList} />;
}

export default TagsContainer;
