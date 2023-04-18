import { styled } from 'config/stitches';

const CopyToClipboardButton = styled('div', {
  visibility: 'hidden',
  top: '0.75rem',
  right: '1rem',
  display: 'inline-block',
  cursor: 'pointer',
  position: 'absolute',
  ai: 'center',
  jc: 'center',
});

const CodeBlockContainer = styled('div', {
  background: '#f2f3f4',
  br: '$3',
  p: '$9 3rem $9 $9',
  position: 'relative',
  minHeight: '3.5rem',
  display: 'flex',
  ai: 'center',
  overflow: 'auto',
  '&:hover': {
    [`${CopyToClipboardButton}`]: {
      visibility: 'visible',
    },
  },
});

const CodeBlockPre = styled('pre', {
  margin: 0,
  fontStyle: 'normal',
  fontSize: '$4',
  lh: '1.3125rem',
  overflow: 'auto',
  fontMono: 15,
});

export { CopyToClipboardButton, CodeBlockContainer, CodeBlockPre };
