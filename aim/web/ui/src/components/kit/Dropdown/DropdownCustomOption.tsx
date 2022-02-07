import React from 'react';
import { OptionProps } from 'react-select';

import { Text, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import './Dropdown.scss';

function DropdownCustomOption(
  props: OptionProps<any>,
): React.FunctionComponentElement<React.ReactNode> | null {
  const { isSelected, isDisabled, innerProps, getStyles, data } = props;
  const { height } = getStyles('option', props);

  return !isDisabled ? (
    <ErrorBoundary>
      <div
        style={{ boxSizing: 'border-box', height: `${height}` }}
        className='DropdownCustomOption'
        {...innerProps}
      >
        <Text
          title={data.label}
          component='span'
          size={14}
          weight={400}
          color={isSelected ? 'info' : 'primary'}
          tint={isSelected ? 100 : 80}
        >
          {data.label}
        </Text>
        {isSelected && <Icon name='check' color='#1473E6' fontSize={14} />}
      </div>
    </ErrorBoundary>
  ) : null;
}

DropdownCustomOption.displayName = 'DropdownCustomOption';

export default React.memo<any>(DropdownCustomOption);
