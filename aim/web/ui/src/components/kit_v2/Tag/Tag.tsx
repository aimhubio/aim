import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Icon from 'components/kit/Icon';

import { styled } from 'config/stitches/stitches.config';

import { ITagProps } from './Tag.d';

const getColors = (color: string, disabled: boolean) => {
  return {
    backgroundColor: `${color}`,
  };
};

const TagContainer = styled('div', {
  width: 'fit-content',
  display: 'inline-flex',
  ai: 'center',
  br: '$3',
  color: '$textPrimary',
  fontWeight: '$2',
  lineHeight: '1',
  variants: {
    font: {
      mono: {
        fontMono: 14,
      },
      default: {
        fontSize: '$3',
      },
    },
    rightIcon: { true: {} },
    size: {
      xs: {
        height: '$1',
        p: '0 $4',
      },
      sm: {
        height: '$2',
        p: '0 $4',
      },
      md: {
        height: '$3',
        p: '0 $6',
      },
      lg: {
        height: '$5',
        p: '0 $6',
      },
    },
    disabled: {
      true: {
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
  },
  compoundVariants: [
    {
      rightIcon: true,
      css: {
        pr: '0',
      },
    },
  ],
});

const RightIcon = styled(Icon, {
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$1',
  ml: '$2',
  fontFamily: '$mono',
  cursor: 'pointer',
  userSelect: 'none',
  variants: {
    size: {
      xs: { mr: '$2' },
      sm: { mr: '$2' },
      md: { mr: '$4' },
      lg: { mr: '$4' },
    },
  },
});

const Tag = React.forwardRef<React.ElementRef<typeof TagContainer>, ITagProps>(
  (
    {
      color = '',
      size = 'md',
      monospace = false,
      disabled = false,
      onDelete,
      label,
      ...rest
    }: ITagProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <ErrorBoundary>
        <TagContainer
          {...rest}
          size={size}
          css={getColors(color, disabled)}
          role='button'
          font={monospace ? 'mono' : 'default'}
          rightIcon={!!onDelete}
          ref={forwardedRef}
          disabled={disabled}
        >
          {label}
          {onDelete && (
            <RightIcon
              role='button'
              name='close'
              fontSize={10}
              size={size}
              onClick={() => onDelete(label)}
            />
          )}
        </TagContainer>
      </ErrorBoundary>
    );
  },
);

Tag.displayName = 'Tag';

export default Tag;
