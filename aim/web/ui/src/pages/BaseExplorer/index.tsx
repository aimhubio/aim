import React from 'react';
// @ts-ignore
import JSONViewer from 'react-json-viewer';

import createPipeline from 'modules/BaseExplorerCore/pipeline';
import BoxVirtualizer from 'modules/BaseExplorer/BoxVirtualizer';

import { Text, Button } from 'components/kit';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import Image from './Image';
import Modifiers from './Modifiers';
import applyStyles from './applyStyles';

const pipeline = createPipeline({
  sequenceName: SequenceTypesEnum.Images,
  query: {
    useCache: true,
  },
  adapter: {
    useCache: true,
    objectDepth: AimObjectDepths.Index,
  },
  modifier: {
    useCache: true,
  },
});

const coordinatesMap = {
  x: 'visuals.x',
  y: 'visuals.y',
  width: 'visuals.width',
  height: 'visuals.height',
};

function BasExplorer() {
  const [status, setStatus] = React.useState('initial');
  const [data, setData] = React.useState<any>([]);

  function onClick() {
    setStatus('pipeline-execution-start');
    pipeline
      .execute({
        query: {
          params: {
            q: 'run.hparams.batch_size == 64',
            p: 500,
          },
        },
      })
      .then((data) => {
        setStatus('visualization-calculation-positions');
        const res = applyStyles(data.data, data.modifierConfig);
        setData({ ...data, data: res });
        setStatus('pipeline-execution-succeed');
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
        {data && (
          <Modifiers
            data={data?.additionalData?.modifiers}
            onChange={onChange}
          />
        )}
      </div>
      <Text size={24} weight={600}>
        Visualization
      </Text>
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
          {data &&
            [...data?.modifierConfig].map((item: any, i: number) => {
              if (i % 2 !== 0)
                return (
                  <Text
                    key={item}
                    style={{
                      maxWidth: 350,
                      position: 'relative',
                      left: 0,
                      top: i * 150,
                    }}
                    size={18}
                    weight={400}
                  >
                    {item}
                  </Text>
                );
            })}
        </div>
        <div
          className='visualizer-container'
          style={{ height: '100%', width: '100%' }}
        >
          <BoxVirtualizer
            visualizableContent={Image}
            data={data?.data || []}
            coordinatesMap={coordinatesMap}
            boxGap={20}
            isVirtualized
          />
        </div>
        {/*<JSONViewer json={data?.data?.slice(0, 10) || []} />*/}
      </div>
      <button onClick={onClick}>Click to call params</button>
      <div className='flex '>
        <div>
          Params <JSONViewer json={data.params || []} />
        </div>
        <div>
          Contexts <JSONViewer json={data.contexts || []} />
        </div>
        <div>
          Modifiers <JSONViewer json={data.modifiers || []} />
        </div>
      </div>
      <div style={{ maxWidth: '100vw' }}>
        Visualization <JSONViewer json={data?.objectList?.slice(0, 10) || []} />
      </div>
    </div>
  );
}

export default BasExplorer;
