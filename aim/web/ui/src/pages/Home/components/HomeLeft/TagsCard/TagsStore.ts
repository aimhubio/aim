import createResource from 'modules/core/utils/createResource';
import { fetchTagsList } from 'modules/core/api/tagsApi';

function createTagsEngine() {
  const { fetchData, state } = createResource<any>(fetchTagsList);
  return { fetchTags: fetchData, tagsState: state };
}

export default createTagsEngine();
