import React from 'react';
import moment from 'moment';

import { Text } from 'components/kit';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { formatValue } from 'utils/formatValue';
import { getValue } from 'utils/helper';

import { ICaptionBoxProps } from '.';

import './CaptionBox.scss';

function CaptionBox(props: ICaptionBoxProps) {
  const {
    engine: {
      useStore,
      controls: {
        captionProperties: { stateSelector },
      },
    },
  } = props;

  const captionProperties = useStore(stateSelector);
  return (
    <div ref={props.captionBoxRef} className='CaptionBox'>
      {captionProperties.selectedFields.map(
        ({ label, value }: any, index: number) => {
          let fieldValue = getValue(props.item, value);
          if (value === 'run.end_time' || value === 'run.creation_time') {
            fieldValue = moment(fieldValue * 1000).format(DATE_WITH_SECONDS);
          }
          return (
            <div key={index} className='CaptionBox__item'>
              <Text size={12} tint={50}>{`${label}: `}</Text>
              <Text size={12}>{formatValue(fieldValue)}</Text>
            </div>
          );
        },
      )}
    </div>
  );
}

CaptionBox.displayName = 'CaptionBox';

export default React.memo<any>(CaptionBox);
