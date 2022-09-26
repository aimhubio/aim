import React from 'react';

import { Spinner, Text } from 'components/kit';
import ReleaseNoteItem from 'components/ReleaseNoteItem/ReleaseNoteItem';

import { AIM_VERSION } from 'config/config';

import GuideLinks from '../GuideDocs/GuideDocs';

import useReleaseNotes from './useReleaseNotes';

import './ReleaseNotes.scss';

function ReleaseNotes(): React.FunctionComponentElement<React.ReactNode> {
  const {
    changelogData,
    currentReleaseData,
    isLoading,
    releaseNoteRef,
    scrollShadow,
  } = useReleaseNotes();

  return (
    <div className='ReleaseNotes'>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className='ReleaseNotes__latest'>
            <div className='ReleaseNotes__latest__title'>
              <Text component='h4' tint={100} weight={700} size={14}>
                Aim {changelogData?.[0]?.tagName}
              </Text>
              <span>New</span>
            </div>
            <div className='ReleaseNotes__latest__content'>
              {changelogData[0]?.info?.map((title: string, index: number) => (
                <div
                  className='ReleaseNotes__latest__content__item'
                  key={index}
                >
                  <Text size={12}>{title.replace(/-/g, ' ')}</Text>
                </div>
              ))}
            </div>
          </div>
          {`v${AIM_VERSION}` === changelogData[0]?.tagName ? null : (
            <div className='ReleaseNotes__changelog'>
              <Text
                className='ReleaseNotes__changelog__title'
                component='h4'
                tint={100}
                weight={700}
                size={14}
              >
                Changelog
              </Text>
              <div
                ref={releaseNoteRef}
                className='ReleaseNotes__changelog__content'
              >
                {changelogData.map((item) => {
                  return (
                    <ReleaseNoteItem
                      key={item.tagName}
                      tagName={item.tagName}
                      info={item.info[0]}
                      href={item.url}
                    />
                  );
                })}
              </div>
              <div
                className={`ReleaseNotes__changelog__currentRelease ${
                  scrollShadow
                    ? 'ReleaseNotes__changelog__currentRelease__scroll'
                    : ''
                }`}
              >
                <ReleaseNoteItem
                  tagName={`${currentReleaseData!.tagName} [current]`}
                  info={currentReleaseData!.info[0]}
                  href={currentReleaseData!.url}
                />
              </div>
            </div>
          )}
          <GuideLinks />
        </>
      )}
    </div>
  );
}

export default React.memo(ReleaseNotes);
