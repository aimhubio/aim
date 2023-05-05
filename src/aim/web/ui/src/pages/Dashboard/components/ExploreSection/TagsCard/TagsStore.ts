import createResource from 'modules/core/utils/createResource';
import { fetchTagsList } from 'modules/core/api/tagsApi';
import { ITagData } from 'modules/core/api/tagsApi/types';

function createTagsEngine() {
  const { fetchData, state, destroy } =
    createResource<ITagData[]>(fetchTagsList);
  return { fetchTags: fetchData, tagsState: state, destroy };
}

export default createTagsEngine();
