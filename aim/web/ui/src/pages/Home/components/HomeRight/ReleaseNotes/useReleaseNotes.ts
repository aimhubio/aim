import React from 'react';

import { IReleaseNote } from 'modules/core/api/releaseNotesApi/types';
import { IResourceState } from 'modules/core/utils/createResource';
import { fetchReleaseByTagName } from 'modules/core/api/releaseNotesApi';

import { AIM_VERSION } from 'config/config';

import createReleaseNotesEngine from './ReleasesStore';

function useReleaseNotes() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentRelease, setCurrentRelease] = React.useState<IReleaseNote>();
  const { current: releaseNotesEngine } = React.useRef(
    createReleaseNotesEngine,
  );
  const releaseNotesStore: IResourceState<IReleaseNote> =
    releaseNotesEngine.releasesState((state) => state);

  React.useEffect(() => {
    releaseNotesEngine.fetchReleases();
    fetchCurrentRelease();
    return () => {
      releaseNotesEngine.releasesState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (releaseNotesStore.data?.length) {
      const currentRelease: IReleaseNote | undefined =
        releaseNotesStore.data?.find(
          (release: IReleaseNote) => release.tag_name === `v${AIM_VERSION}`,
        );
      if (currentRelease) {
        setCurrentRelease(currentRelease);
      } else {
        fetchCurrentRelease();
      }
    }
  }, [releaseNotesStore.data]);

  async function fetchCurrentRelease() {
    try {
      const data = await fetchReleaseByTagName(`v${AIM_VERSION}`);
      setCurrentRelease(data);
      setLoading(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  return {
    data: releaseNotesStore.data,
    currentRelease,
    isLoading: loading,
  };
}

export default useReleaseNotes;
