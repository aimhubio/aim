import { styled } from 'config/stitches';

const TableCellStyled = styled('td', {
  p: '$3 $7',
  height: '$3',
  border: '1px solid  rgba(180, 191, 202, 0.3)',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  '.AudiosList': {
    height: 'unset !important',
  },
});

const TableStyled = styled('table', {
  borderCollapse: 'collapse',
  width: '100%',
  borderSpacing: '0',
  color: '#1F2227',
  fontSize: '$3',
  br: '$3',
  overflow: 'hidden',
  variants: {
    size: {
      small: {
        fontSize: '$3',
      },
      medium: {
        fontSize: '$4',
      },
      large: {
        fontSize: '$5',
      },
    },
  },
});

const TableHeadStyled = styled('th', {
  height: '$9',
  p: '0 $7',
  textAlign: 'left',
  border: '1px solid  rgba(180, 191, 202, 0.3)',
  verticalAlign: 'middle',
  fontWeight: '$3',
  bc: '#F7F8FA',
  fontSize: '11px',
});

const TableBodyStyled = styled('tbody', {});

const TableRowStyled = styled('tr', {
  '&:hover': {
    backgroundColor: '#F7F8FA',
  },
  variants: {
    isFocused: {
      true: {
        backgroundColor: ' #E9F2FE',
        '&:hover': {
          backgroundColor: '#D3E4FD',
        },
      },
    },
  },
});

const TableHeaderStyled = styled('thead', {});

export {
  TableCellStyled,
  TableStyled,
  TableHeadStyled,
  TableBodyStyled,
  TableRowStyled,
  TableHeaderStyled,
};
