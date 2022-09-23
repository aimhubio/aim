import { fetchReleaseNotes } from 'modules/core/api/releaseNotesApi';
import { IReleaseNote } from 'modules/core/api/releaseNotesApi/types';
import createResource from 'modules/core/utils/createResource';

function createReleasesEngine() {
  const { fetchData, state } =
    createResource<IReleaseNote[]>(fetchReleaseNotes);
  return { fetchReleases: fetchData, releasesState: state };
}

export default createReleasesEngine();
