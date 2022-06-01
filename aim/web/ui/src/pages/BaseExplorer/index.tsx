import React, { useEffect } from 'react';
// @ts-ignore
import JSONViewer from 'react-json-viewer';

// import createPipeline from 'modules/BaseExplorerCore/pipeline';
import BoxVirtualizer from 'modules/BaseExplorer/BoxVirtualizer';

import { Button, Text } from 'components/kit';

// import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import createQuery, {
  Query,
} from '../../modules/BaseExplorerCore/pipeline/query';
import { AimObjectDepths, SequenceTypesEnum } from '../../types/core/enums';
import createAdapter, {
  Adapter,
} from '../../modules/BaseExplorerCore/pipeline/adapter';

import Image from './Image';
import Modifiers from './Modifiers';
import applyStyles from './applyStyles';

// const pipeline = createPipeline({
//   sequenceName: SequenceTypesEnum.Images,
//   query: {
//     useCache: true,
//   },
//   adapter: {
//     useCache: true,
//     objectDepth: AimObjectDepths.Index,
//   },
//   modifier: {
//     useCache: true,
//   },
// });

const coordinatesMap = {
  x: 'visuals.x',
  y: 'visuals.y',
  width: 'visuals.width',
  height: 'visuals.height',
};
// createAdapter({
//     objectDepth: AimObjectDepths.Index,
//     sequenceName: SequenceTypesEnum.Images,
//     useCache: false,
// }),
function BasExplorer() {
  const [status, setStatus] = React.useState('initial');
  const [data, setData] = React.useState<any>([]);

  const queryRef = React.useRef<Adapter>(
    createAdapter({
      objectDepth: AimObjectDepths.Index,
      sequenceName: SequenceTypesEnum.Images,
      useCache: false,
      statusCallback: (status) => setStatus(status),
    }),
  );
  function onClick() {
    queryRef.current
      // @ts-ignore
      ?.execute([])
      .then((data) => {
        // const res = applyStyles(data.data, data.modifierConfig);
        setStatus('finished');
        console.log(data);
        setData(data);
      })
      .catch((err) => {
        console.log(err);
        setStatus('pipeline execution failed');
      });
  }

  function onChange(d: any) {
    console.log(d);
  }

  return (
    <div style={{ width: '100%', height: '100vh', padding: '10px' }}>
      <h2>Status ::: {status}</h2>
      <div className='flex fjc fac' style={{ marginTop: 10 }}>
        <Button onClick={onClick} color='primary' variant='contained'>
          Search
        </Button>
        {/*{data && (*/}
        {/*  <Modifiers*/}
        {/*    data={data?.additionalData?.modifiers}*/}
        {/*    onChange={onChange}*/}
        {/*  />*/}
        {/*)}*/}
      </div>
      <Text size={24} weight={600}>
        Visualization
      </Text>
      <JSONViewer json={data?.additionalData || []} />
      <div
        style={{
          maxWidth: '100vw',
          height: '100%',
          width: '100%',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: 400,
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/*{data &&*/}
          {/*  [...data?.modifierConfig].map((item: any, i: number) => {*/}
          {/*    if (i % 2 !== 0)*/}
          {/*      return (*/}
          {/*        <Text*/}
          {/*          key={item}*/}
          {/*          style={{*/}
          {/*            maxWidth: 350,*/}
          {/*            position: 'relative',*/}
          {/*            left: 0,*/}
          {/*            top: i * 150,*/}
          {/*          }}*/}
          {/*          size={18}*/}
          {/*          weight={400}*/}
          {/*        >*/}
          {/*          {item}*/}
          {/*        </Text>*/}
          {/*      );*/}
          {/*  })}*/}
        </div>
        <div
          className='visualizer-container'
          style={{ height: '100%', width: '100%' }}
        >
          {/*<BoxVirtualizer*/}
          {/*  visualizableContent={Image}*/}
          {/*  data={data?.data || []}*/}
          {/*  coordinatesMap={coordinatesMap}*/}
          {/*  boxGap={20}*/}
          {/*  isVirtualized*/}
          {/*/>*/}
        </div>
        {/*<JSONViewer json={data?.data?.slice(0, 10) || []} />*/}
      </div>
      {/*<button onClick={onClick}>Click to call params</button>*/}
      <div className='flex '>
        <div>Data</div>
        {/*<div>*/}
        {/*  Contexts <JSONViewer json={data.contexts || []} />*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*  Modifiers <JSONViewer json={data.modifiers || []} />*/}
        {/*</div>*/}
      </div>
    </div>
  );
}

export default BasExplorer;
