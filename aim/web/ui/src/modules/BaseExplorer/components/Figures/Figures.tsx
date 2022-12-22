import * as React from 'react';
import Plot from 'react-plotly.js';

import { Skeleton } from '@material-ui/lab';

import { IBoxProps } from '../../types';
import { BATCH_COLLECT_DELAY } from '../../../../config/mediaConfigs/mediaConfigs';

function Figures(props: IBoxProps) {
  let [data, setData] = React.useState<any>(null);
  let [scale, setScale] = React.useState<number | null | undefined>(
    !!props.style ? undefined : null,
  );
  let containerRef = React.useRef<HTMLDivElement | null>(null);

  const [blobData, setBlobData] = React.useState<string>(
    props.engine.blobURI.getBlobData(props.data.data.blob_uri),
  );

  React.useEffect(() => {
    let rAFRef: number | null = null;

    if (blobData) {
      window.requestAnimationFrame(() => {
        setData(JSON.parse(blobData));
      });
    }

    return () => {
      if (rAFRef) {
        window.cancelAnimationFrame(rAFRef);
      }
    };
  }, [blobData]);

  React.useEffect(() => {
    let unsubscribe: () => void;
    if (blobData === null) {
      if (props.engine.blobURI.getBlobData(props.data.data.blob_uri)) {
        setBlobData(props.engine.blobURI.getBlobData(props.data.data.blob_uri));
      } else {
        unsubscribe = props.engine.blobURI.on(
          props.data.data.blob_uri,
          (bd: string) => {
            setBlobData(bd);
            unsubscribe();
          },
        );
        if (props.engine.blobURI.getBlobData(props.data.data.blob_uri)) {
          setBlobData(
            props.engine.blobURI.getBlobData(props.data.data.blob_uri),
          );
          unsubscribe();
        } else {
          props.engine.blobURI.addUriToQueue(props.data.data.blob_uri);
        }
      }
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobData]);

  React.useEffect(() => {
    if (data && containerRef.current && props.style) {
      let plot = containerRef.current.firstChild;
      let container = containerRef.current.parentElement;
      if (plot && container) {
        let width = containerRef.current.offsetWidth + 20;
        let height = containerRef.current.offsetHeight + 20;
        let containerWidth = container.offsetWidth;
        let containerHeight = container.offsetHeight - 30;

        let wK = containerWidth / width; // Calculate width ratio
        let hK = containerHeight / height; // Calculate height ratio

        if (wK < 1 || hK < 1) {
          setScale(Math.min(wK, hK)); // Apply scale based on object-fit: 'contain' pattern
        } else {
          setScale(null);
        }
      }
    }
  }, [data, props.style]);

  return data ? (
    <div
      style={{
        display: 'inline-block',
        visibility: scale === undefined ? 'hidden' : 'visible',
        transform:
          scale === undefined || scale === null ? '' : `scale(${scale})`,
      }}
      ref={containerRef}
    >
      <Plot
        onInitialized={(figure) => console.log(figure, data)}
        data={data.data}
        layout={data.layout}
        frames={data.frames}
        useResizeHandler={true}
      />
    </div>
  ) : (
    <Skeleton
      variant='rect'
      height={containerRef.current?.offsetHeight! + 20 || props.style?.height}
      width={containerRef.current?.offsetWidth! + 20 || props.style?.width}
    />
  );
}

export default React.memo<IBoxProps>(Figures);
