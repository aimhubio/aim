import React from 'react';
import moment from 'moment';

import { Badge, Text } from 'components/kit';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { formatValue } from 'utils/formatValue';
import { getValue } from 'utils/helper';
import contextToString from 'utils/contextToString';

import { SelectOption } from '../Controls/CaptionProperties';

import { ICaptionBoxProps } from '.';

import './CaptionBox.scss';

function CaptionBox(props: ICaptionBoxProps) {
  const {
    captionBoxRef,
    visualizationName,
    engine: {
      useStore,
      visualizations,
      pipeline: { additionalDataSelector },
    },
  } = props;
  const {
    controls: {
      captionProperties: { stateSelector },
    },
  } = visualizations[visualizationName];

  const captionProperties = useStore(stateSelector);
  const availableModifiers = useStore(additionalDataSelector);

  const options = React.useMemo(() => {
    const modifiers = availableModifiers?.modifiers ?? [];
    const optionsData: SelectOption[] = modifiers.map((modifier: string) => {
      return {
        label: modifier,
        value: modifier,
        group: modifier.slice(0, modifier.indexOf('.')),
      };
    });
    return optionsData;
  }, [availableModifiers?.modifiers]);

  const values: SelectOption[] = React.useMemo(() => {
    let data: { value: string; group: string; label: string }[] = [];
    options.forEach((option: SelectOption) => {
      if (captionProperties.selectedFields.indexOf(option.value) !== -1) {
        data.push(option);
      }
    });

    // Sort selected values by the order of their application
    return data.sort(
      (a, b) =>
        captionProperties.selectedFields.indexOf(a.value) -
        captionProperties.selectedFields.indexOf(b.value),
    );
  }, [options, captionProperties.selectedFields]);

  return (
    <div ref={captionBoxRef} className='CaptionBox'>
      {values.map(({ label, value }: any, index: number) => {
        let fieldValue = getValue(props.item, value);
        if (value === 'run.end_time' || value === 'run.creation_time') {
          fieldValue = formatValue(
            moment(fieldValue * 1000).format(DATE_WITH_SECONDS),
          );
        } else if (value.includes('.context') && !value.startsWith('run.')) {
          fieldValue = (
            <Badge
              className='BoxFullViewPopover__container__detail-item__badge'
              monospace
              size='xSmall'
              label={contextToString(fieldValue) || 'Empty Context'}
            />
          );
        } else {
          fieldValue = formatValue(fieldValue);
        }
        return (
          <div key={index} className='CaptionBox__item'>
            <Text size={12} tint={50}>{`${label}: `}</Text>
            <Text size={12}>{fieldValue}</Text>
          </div>
        );
      })}
    </div>
  );
}

CaptionBox.displayName = 'CaptionBox';

export default React.memo<any>(CaptionBox);
