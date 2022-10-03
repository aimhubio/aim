import React from 'react';

import { IReleaseNote } from 'modules/core/api/releaseNotesApi/types';
import { IResourceState } from 'modules/core/utils/createResource';
import { fetchReleaseByTagName } from 'modules/core/api/releaseNotesApi';

import { AIM_VERSION } from 'config/config';

import createReleaseNotesEngine from './ReleasesStore';

const CHANGELOG_CONTENT_HEIGHT = 290;
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
      releaseNoteRef?.current?.removeEventListener(
        'scroll',
        onChangelogContentScroll,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseNotesStore.data]);

  React.useEffect(() => {
    if (!loading) {
      setMounted(true);
    }
    if (mounted && releaseNoteRef.current) {
      if (releaseNoteRef?.current?.scrollHeight > CHANGELOG_CONTENT_HEIGHT) {
        setScrollShadow(true);
      }
      releaseNoteRef?.current?.addEventListener(
        'scroll',
        onChangelogContentScroll,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mounted]);

  function onChangelogContentScroll() {
    const hasScrollShadow: boolean =
      releaseNoteRef!.current!.scrollTop + CHANGELOG_CONTENT_HEIGHT <
      releaseNoteRef!.current!.scrollHeight;
    if (hasScrollShadow !== scrollShadow) {
      setScrollShadow(!!hasScrollShadow);
    }
  }

  async function fetchCurrentRelease(): Promise<void> {
    try {
      const data = await fetchReleaseByTagName(`v${AIM_VERSION}`);
      setCurrentRelease(data);
      setLoading(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  function modifyReleaseNote(
    releaseBody: string,
  ): RegExpMatchArray | null | any {
    let body = releaseBody;
    const regTitle = /#{2}.+/g;
    const regTitleMatch = body.match(regTitle)?.[0].replace(/#{2}/g, '');
    return [regTitleMatch];
  }

  function getCurrentReleaseInfo(releaseBody: string): RegExpMatchArray | null {
    const exp = /(?:^|\n)(?:d.|[*+-]) [^]*?(?=\n(?:d.|[*+-])|$)/g;
    let body = releaseBody;
    let str = body
      .replace(/(\r\n|\n|\r)/g, '\n')
      .replace(/\*/g, '-')
      .replace(
        /\sby\s\@[A-z\d](?:[A-z\d]|-(?=[A-z\d])){0,38}\s\w+\shttps\:\/\/github\.com\/((\w+\/?){4})/g,
        '',
      );
    return str.match(exp);
  }

  const changelogData: { tagName: string; info: any; url: string }[] =
    React.useMemo(() => {
      const data: { tagName: string; info: any; url: string }[] = [];
      releaseNotesStore?.data?.some((release: IReleaseNote) => {
        const info = modifyReleaseNote(release.body);
        if (release.tag_name === `v${AIM_VERSION}`) {
          data.push({
            tagName: release.tag_name,
            info: modifyReleaseNote(release.body),
            url: release.html_url,
          });
          return true;
        }
        if (info) {
          data.push({
            tagName: release.tag_name,
            info: modifyReleaseNote(release.body),
            url: release.html_url,
          });
        }
      });
      return data;
    }, [releaseNotesStore.data]);

  const currentReleaseData:
    | { tagName: string; info: any; url: string }
    | undefined = React.useMemo(() => {
    if (currentRelease) {
      return {
        tagName: currentRelease?.tag_name,
        info: modifyReleaseNote(currentRelease?.body),
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
        info: getCurrentReleaseInfo(latest.body),
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
