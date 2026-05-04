import React from 'react';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import { Text } from 'components/kit';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import videosExploreService from 'services/api/videosExplore/videosExplore';

import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

import { ITraceVisualizerProps } from '../types';

import './VideosVisualizer.scss';

type VideoItem = {
  blob_uri: string;
  caption?: string;
  context?: object;
  format?: string;
  fps?: number;
  index?: number;
  key?: string;
  name?: string;
  size?: number;
  step?: number;
};

type BlobState = {
  error?: string;
  isLoading?: boolean;
  url?: string;
};

function getVideoMimeType(format?: string): string {
  switch ((format || '').toLowerCase()) {
    case 'gif':
      return 'image/gif';
    case 'm4v':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    case 'mp4':
    default:
      return 'video/mp4';
  }
}

function formatBytes(bytes?: number): string | null {
  if (!bytes) {
    return null;
  }
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getBlobErrorStates(uris: string[], error: string) {
  return uris.reduce<Record<string, BlobState>>((states, uri) => {
    states[uri] = { error, isLoading: false };
    return states;
  }, {});
}

function VideosVisualizer({
  data,
  isLoading,
}: ITraceVisualizerProps): React.FunctionComponentElement<React.ReactNode> {
  const videos: VideoItem[] = React.useMemo(() => data?.videos || [], [data]);
  const [blobStates, setBlobStates] = React.useState<Record<string, BlobState>>(
    {},
  );
  const requestsRef = React.useRef<Record<string, { abort: () => void }>>({});
  const pendingVideosRef = React.useRef<Record<string, VideoItem>>({});
  const flushTimeoutRef = React.useRef<number | null>(null);
  const urlsRef = React.useRef<Record<string, string>>({});
  const formatsRef = React.useRef<Record<string, string | undefined>>({});

  React.useEffect(() => {
    videos.forEach((video) => {
      formatsRef.current[video.blob_uri] = video.format;
    });
  }, [videos]);

  React.useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        window.clearTimeout(flushTimeoutRef.current);
      }
      Array.from(new Set(Object.values(requestsRef.current))).forEach(
        (request) => request.abort(),
      );
      Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      requestsRef.current = {};
      pendingVideosRef.current = {};
      urlsRef.current = {};
    };
  }, []);

  const flushPendingVideoBlobRequests = React.useCallback(() => {
    flushTimeoutRef.current = null;

    const pendingVideos = pendingVideosRef.current;
    pendingVideosRef.current = {};
    const uris = Object.keys(pendingVideos).filter(
      (uri) => !urlsRef.current[uri] && !requestsRef.current[uri],
    );

    if (!uris.length) {
      return;
    }

    const request = videosExploreService.getVideosByURIs(uris);
    uris.forEach((uri) => {
      requestsRef.current[uri] = request;
    });
    request
      .call()
      .then(async (stream) => {
        let bufferPairs = decodeBufferPairs(stream);
        let decodedPairs = decodePathsVals(bufferPairs);
        let objects = iterFoldTree(decodedPairs, 1);
        const loadedUris = new Set<string>();

        for await (let [keys, val] of objects) {
          const URI = keys[0] as string;
          loadedUris.add(URI);
          const blob = new Blob([val as ArrayBuffer], {
            type: getVideoMimeType(formatsRef.current[URI]),
          });
          const url = URL.createObjectURL(blob);
          if (urlsRef.current[URI]) {
            URL.revokeObjectURL(urlsRef.current[URI]);
          }
          urlsRef.current[URI] = url;
          setBlobStates((state) => ({
            ...state,
            [URI]: { isLoading: false, url },
          }));
        }

        const missingUris = uris.filter((uri) => !loadedUris.has(uri));
        if (missingUris.length) {
          setBlobStates((state) => ({
            ...state,
            ...getBlobErrorStates(missingUris, 'Video blob not found'),
          }));
        }
      })
      .catch((ex) => {
        if (ex?.name !== 'AbortError') {
          setBlobStates((state) => ({
            ...state,
            ...getBlobErrorStates(uris, 'Could not load video'),
          }));
        }
      })
      .finally(() => {
        uris.forEach((uri) => {
          if (requestsRef.current[uri] === request) {
            delete requestsRef.current[uri];
          }
        });
      });
  }, []);

  const requestVideoBlob = React.useCallback(
    (video: VideoItem) => {
      const uri = video.blob_uri;
      if (
        !uri ||
        urlsRef.current[uri] ||
        requestsRef.current[uri] ||
        pendingVideosRef.current[uri]
      ) {
        return;
      }

      formatsRef.current[uri] = video.format;
      pendingVideosRef.current[uri] = video;
      setBlobStates((state) => ({
        ...state,
        [uri]: { ...state[uri], isLoading: true },
      }));

      if (!flushTimeoutRef.current) {
        flushTimeoutRef.current = window.setTimeout(
          flushPendingVideoBlobRequests,
          30,
        );
      }
    },
    [flushPendingVideoBlobRequests],
  );

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        className='VisualizationLoader'
        isLoading={!!isLoading}
      >
        <div className='VideosVisualizer'>
          {videos.length ? (
            <div className='VideosVisualizer__grid'>
              {videos.map((video) => (
                <VideoCard
                  key={video.key || `${video.blob_uri}-${video.step}`}
                  blobState={blobStates[video.blob_uri] || {}}
                  onRequestBlob={requestVideoBlob}
                  video={video}
                />
              ))}
            </div>
          ) : (
            <IllustrationBlock
              page='runs'
              type={IllustrationsEnum.EmptyData}
              size='xLarge'
              title='No Videos In Selected Range'
            />
          )}
        </div>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

function VideoCard({
  blobState,
  onRequestBlob,
  video,
}: {
  blobState: BlobState;
  onRequestBlob: (video: VideoItem) => void;
  video: VideoItem;
}) {
  const cardRef = React.useRef<HTMLElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      onRequestBlob(video);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting || false;
        setIsVisible(visible);
        if (visible) {
          onRequestBlob(video);
        }
      },
      { rootMargin: '360px 0px', threshold: 0.1 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [onRequestBlob, video]);

  React.useEffect(() => {
    const player = videoRef.current;
    if (!player) {
      return;
    }
    if (isVisible && blobState.url) {
      const playPromise = player.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    } else {
      player.pause();
    }
  }, [blobState.url, isVisible]);

  const sizeText = formatBytes(video.size);
  const isGif = (video.format || '').toLowerCase() === 'gif';
  const details = [
    typeof video.step === 'number' ? `step ${video.step}` : null,
    typeof video.index === 'number' ? `index ${video.index}` : null,
    video.fps ? `${video.fps} fps` : null,
    sizeText,
  ].filter(Boolean);

  return (
    <article className='VideosVisualizer__card' ref={cardRef}>
      <div className='VideosVisualizer__mediaBox'>
        {isGif ? (
          <img
            src={blobState.url}
            alt={video.caption || video.name || 'Video'}
          />
        ) : (
          <video
            ref={videoRef}
            src={blobState.url}
            controls
            autoPlay={isVisible}
            loop
            muted
            playsInline
            preload='metadata'
          />
        )}
        {!blobState.url && (
          <div className='VideosVisualizer__placeholder'>
            <Text size={12} tint={70}>
              {blobState.error ||
                (blobState.isLoading ? 'Loading video' : 'Queued')}
            </Text>
          </div>
        )}
      </div>
      <div className='VideosVisualizer__meta'>
        <Text size={14} weight={600} tint={100} component='h3'>
          {video.caption || video.name || 'Video'}
        </Text>
        {!!details.length && (
          <Text size={12} tint={70}>
            {details.join(' · ')}
          </Text>
        )}
      </div>
    </article>
  );
}

VideosVisualizer.displayName = 'VideosVisualizer';

export default React.memo(VideosVisualizer);
