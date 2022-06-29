import React from 'react';
import classNames from 'classnames';

import Autocomplete from '@material-ui/lab/Autocomplete';
import { InputBase } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import { MEDIA_SET_TITLE_HEIGHT } from 'config/mediaConfigs/mediaConfigs';

import { IDepthDropdownProps } from './DepthDropdown.d';

import './DepthDropdown.scss';

function DepthDropdown({
  index,
  pathValue,
  depth,
  onDepthChange,
}: IDepthDropdownProps): React.FunctionComponentElement<React.ReactNode> {
  const depthOptions = React.useMemo(() => {
    return (pathValue as string[]).map((v, i) => ({
      depth: i,
      label: v,
    }));
  }, [pathValue]);
  return (
    <ErrorBoundary>
      <ControlPopover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        className='DepthDropdown'
        anchor={({ onAnchorClick, opened }) => (
          <Button
            onClick={onAnchorClick}
            className='DepthDropdown__button'
            color={opened ? 'primary' : 'default'}
            size='small'
            withOnlyIcon
            style={{ height: MEDIA_SET_TITLE_HEIGHT }}
          >
            <Icon name={opened ? 'arrow-up' : 'arrow-down'} />
          </Button>
        )}
        component={
          <Autocomplete
            open
            size='small'
            openOnFocus
            disablePortal={true}
            disableCloseOnSelect
            className='DepthDropdown__autocomplete'
            options={depthOptions}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option) => option.depth === depth}
            onChange={(e, value) => {
              onDepthChange?.(value.depth, index);
            }}
            disableClearable={true}
            ListboxProps={{
              style: {
                maxHeight: 200,
                maxWidth: 241,
              },
            }}
            classes={{
              popper: 'DepthDropdown__autocomplete__popper',
            }}
            renderInput={(params) => (
              <InputBase
                ref={params.InputProps.ref}
                inputProps={params.inputProps}
                spellCheck={false}
                placeholder='Search'
                autoFocus={true}
                className='DepthDropdown__autocomplete__select'
              />
            )}
            renderOption={(option) => (
              <>
                <Text
                  className={classNames(
                    'DepthDropdown__autocomplete__select__optionLabel',
                    {
                      selected: depth === option.depth,
                    },
                  )}
                  weight={500}
                  size={12}
                >
                  {option.label}
                </Text>
                {depth === option.depth && (
                  <Icon
                    fontSize={14}
                    color='primary'
                    name='check'
                    className='DepthDropdown__autocomplete__select__optionIcon'
                  />
                )}
              </>
            )}
          />
        }
      />
    </ErrorBoundary>
  );
}

DepthDropdown.displayName = 'DepthDropdown';

export default React.memo<IDepthDropdownProps>(DepthDropdown);
