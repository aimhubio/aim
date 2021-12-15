import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Select, {
  ClearIndicatorProps,
  components,
  ControlProps,
} from 'react-select';

import { Icon, Text } from 'components/kit';

import DropdownCustomOption from './DropdownCustomOption';
import {
  baseSizes,
  indicatorsContainerSizes,
  labelTopPosition,
} from './config';

import { IDropdownProps } from '.';

import './Dropdown.scss';

/**
 * @property {number} size - input size
 * @property {{value: string; label: string}[]} options - options list
 * @property {boolean} open - is dropdown open
 * @property {string} placeholder - dropdown placeholder
 * @property {{value: string; label: string}} value - dropdown value
 * @property {boolean} withPortal - open dropdown menu in portal
 * @property {function} onMenuOpen - callBack on menu opening
 * @property {function} onMenuClose - callBack on menu closing
 * @property {function} onChange - callBack on dropdown value change
 * @property {boolean} isColored - color dropdown if it is used
 * @property {string} label - swap label to top if dropdown has value and replace placeholder
 * @property {IIconProps} icon - icon for dropdown input
 * @property {React.HTMLAttributes} rest - rest properties that can be set
 */
function Dropdown({
  size = 'medium',
  options,
  open = false,
  placeholder = 'Select...',
  value = null,
  className = '',
  withPortal,
  onMenuOpen,
  onMenuClose,
  onChange,
  isClearable = false,
  isColored = false,
  maxMenuListHeight = '12.5rem',
  label,
  icon,
  ...rest
}: IDropdownProps): React.FunctionComponentElement<React.ReactNode> {
  const [labelSwapped, setLabelSwapped] = useState(!!value);
  const customStyles = {
    iconStyles: () =>
      ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 0.5rem',
        color: icon?.color || '#1473E6',
        width: '1.5rem',
        height: '1.5rem',
        fontSize: icon?.fontSize,
        pointerEvents: 'none',
      } as React.CSSProperties),
    control: (base: any) => ({
      ...base,
      height: baseSizes[size],
      minHeight: baseSizes[size],
      borderRadius: '0.375rem',
      boxShadow: 'none',
      borderColor:
        isColored && value ? '#1473E6' : open ? '#90AFDA' : '#BDCEE8',
      '&:hover': {
        borderColor:
          isColored && value ? '#1473E6' : open ? '#90AFDA' : '#BDCEE8',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: indicatorsContainerSizes[size],
      padding: '0.375rem 0',
    }),
    placeholder: (holder: any) => ({
      ...holder,
      fontSize: '0.875rem',
      color: '#606986',
      marginBottom: '0.0625rem',
    }),
    input: (provided: any) => ({
      ...provided,
      margin: '0',
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: indicatorsContainerSizes[size],
      padding: icon ? '0 0.375rem 0 0rem' : '0 0.375rem 0 1rem',
      fontSize: '0.875rem',
      color: isColored && value ? '#1473E6' : '#414B6D',
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 1000000,
      position: 'fixed',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      marginLeft: 0,
      color: isColored && value ? '#1473E6' : '#414B6D',
      marginBottom: '0.0625rem',
    }),
    dropdownIndicator: () => ({
      marginRight: '0.625rem',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    }),
    clearIndicator: () => ({
      padding: '0 0.625rem',
      borderLeft: '1px solid #D1DDEF',
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '0.375rem',
      padding: '0.5rem',
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: maxMenuListHeight,
    }),
    option: (provided: any) => ({
      ...provided,
      height: baseSizes[size],
    }),
  };

  function ClearIndicator(props: ClearIndicatorProps<any>) {
    const {
      children = <Icon name='close' fontSize={'0.625rem'} />,
      getStyles,
      innerProps: { ref, ...restInnerProps },
    } = props;
    return (
      <div
        {...restInnerProps}
        ref={ref}
        style={getStyles('clearIndicator', props) as any}
      >
        <div className='Dropdown__indicatorContainer'>{children}</div>
      </div>
    );
  }

  function DropdownIndicator(props: any) {
    const {
      children = (
        <Icon
          name={open ? 'arrow-up' : 'arrow-down'}
          fontSize={'0.75rem'}
          color='#414B6D'
        />
      ),
      getStyles,
      innerProps: { ref, ...restInnerProps },
    } = props;
    return (
      <div
        {...restInnerProps}
        ref={ref}
        style={getStyles('dropdownIndicator', props)}
      >
        <div className='Dropdown__indicatorContainer'>{children}</div>
      </div>
    );
  }

  function Control({ children, ...props }: ControlProps<any, false>) {
    return (
      <components.Control {...props}>
        {icon ? (
          <span style={customStyles.iconStyles()}>
            <Icon {...icon} />
          </span>
        ) : null}
        {children}
      </components.Control>
    );
  }

  function handleMenuOpen() {
    onMenuOpen();
    !labelSwapped && setLabelSwapped(true);
  }

  function handleMenuClose() {
    onMenuClose();
    !value && setLabelSwapped(false);
  }

  useEffect(() => {
    value && !labelSwapped && setLabelSwapped(true);
  }, [value]);

  return (
    <div className='Dropdown'>
      {label && (
        <Text
          component='span'
          size={labelSwapped ? 11 : 14}
          weight={500}
          style={{
            top: labelTopPosition[size],
            left: icon ? (labelSwapped ? '1rem' : '2.5rem') : '1rem',
          }}
          color={isColored && value ? 'info' : 'primary'}
          tint={isColored && value ? 100 : 70}
          className={classNames('Dropdown__label', { swapped: labelSwapped })}
        >
          {label}
        </Text>
      )}
      <Select
        {...rest}
        value={
          options.find(
            (option: { value: string; label: string }) =>
              value === option.value,
          ) || null
        }
        className={classNames({ [className]: className })}
        options={options}
        menuPortalTarget={withPortal && document.querySelector('body')}
        menuIsOpen={open}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        placeholder={!label && placeholder}
        onChange={onChange as any}
        isClearable={isClearable}
        components={{
          Option: DropdownCustomOption,
          ClearIndicator: ClearIndicator,
          DropdownIndicator: DropdownIndicator,
          Control,
        }}
        styles={customStyles}
        menuPlacement='auto'
      />
    </div>
  );
}

Dropdown.displayName = 'Dropdown';

export default React.memo<IDropdownProps>(Dropdown);
