import React from 'react';
import _ from 'lodash-es';
import { marked } from 'marked';

import { AIM_VERSION } from 'config/config';

import { IReleaseNote } from 'modules/core/api/releaseNotesApi/types';
import { IResourceState } from 'modules/core/utils/createResource';
import { fetchReleaseByTagName } from 'modules/core/api/releaseNotesApi';

import createReleaseNotesEngine from './ReleasesStore';

const CHANGELOG_CONTENT_MAX_HEIGHT = 296;
function useReleaseNotes() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [scrollShadow, setScrollShadow] = React.useState<boolean>(false);
  const [currentRelease, setCurrentRelease] = React.useState<IReleaseNote>();
  const { current: releaseNotesEngine } = React.useRef(
    createReleaseNotesEngine,
  );
  const releaseNotesStore: IResourceState<IReleaseNote[]> =
    releaseNotesEngine.releasesState((state) => state);
  const releaseNoteRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const releaseNoteNode = releaseNoteRef.current;

    if (releaseNotesStore.data?.length) {
      // detect current release in fetched release notes
      const release: IReleaseNote | undefined = releaseNotesStore.data?.find(
        (release: IReleaseNote) => release.tag_name === `v${AIM_VERSION}`,
      );
      if (release) {
        setCurrentRelease(release);
        setLoading(false);
      } else {
        fetchCurrentRelease();
      }
    } else {
      releaseNotesEngine.fetchReleases();
    }
    return () => {
      releaseNoteNode?.removeEventListener('scroll', onChangelogContentScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseNotesStore.data]);

  React.useEffect(() => {
    if (!loading) {
      setMounted(true);
    }
    if (mounted && releaseNoteRef.current) {
      if (
        releaseNoteRef?.current?.scrollHeight > CHANGELOG_CONTENT_MAX_HEIGHT
      ) {
        setScrollShadow(true);
      }
      releaseNoteRef?.current?.addEventListener(
        'scroll',
        onChangelogContentScroll,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mounted]);

  const onChangelogContentScroll = _.throttle(() => {
    const hasScrollShadow: boolean =
      releaseNoteRef!.current!.scrollTop + CHANGELOG_CONTENT_MAX_HEIGHT <=
      releaseNoteRef!.current!.scrollHeight;
    setScrollShadow(hasScrollShadow);
  }, 150);
  async function fetchCurrentRelease(): Promise<void> {
    try {
      const data = await fetchReleaseByTagName(`v${AIM_VERSION}`);
      setCurrentRelease(data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  function getLatestReleaseInfo(releaseBody: string): RegExpMatchArray | null {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = marked.parse(releaseBody);
    const listElements: string[] = [];
    wrapper.querySelectorAll('li').forEach((li, index) => {
      if (index < 4) {
        listElements.push(
          li.innerText.replace(
            // eslint-disable-next-line no-useless-escape
            /(\sby\s\@[A-z\d](?:[A-z\d]|-(?=[A-z\d])){0,38}\s\w+\shttps\:\/\/github\.com\/((\w+\/?){4}))/g,
            '',
          ),
        );
      } else {
        return;
      }
    });
    return listElements;
  }

  // function to modify release notes name
  function modifyReleaseName(releaseTitle: string): string {
    // eslint-disable-next-line no-useless-escape
    return releaseTitle.replace(/(^\🚀\s*v\d+\.\d+\.\d+\s*\-\s*)/, '');
  }

  const changelogData: { tagName: string; info: any; url: string }[] =
    React.useMemo(() => {
      const data: { tagName: string; info: any; url: string }[] = [];
      releaseNotesStore?.data?.some((release: IReleaseNote) => {
        if (release.tag_name === `v${AIM_VERSION}`) {
          return true;
        }
        data.push({
          tagName: release.tag_name,
          info: modifyReleaseName(release.name),
          url: release.html_url,
        });
        return false;
      });
      return data;
    }, [releaseNotesStore.data]);

  const currentReleaseData:
    | { tagName: string; info: any; url: string }
    | undefined = React.useMemo(() => {
    if (currentRelease) {
      return {
        tagName: currentRelease?.tag_name,
        info: modifyReleaseName(currentRelease?.name),
        url: currentRelease.html_url,
      };
    }
  }, [currentRelease]);

  const LatestReleaseData:
    | { tagName: string; info: any; url: string }
    | undefined = React.useMemo(() => {
    const latest = releaseNotesStore?.data?.[0];
    if (latest) {
      return {
        tagName: latest?.tag_name,
        info: getLatestReleaseInfo(latest.body),
        url: latest.html_url,
      };
    }
  }, [releaseNotesStore.data]);

  return {
    changelogData,
    currentReleaseData,
    LatestReleaseData,
    isLoading: loading,
    releaseNoteRef,
    scrollShadow,
  };
}

export default useReleaseNotes;
