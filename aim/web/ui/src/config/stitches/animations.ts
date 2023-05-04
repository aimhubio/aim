import { keyframes } from '.';

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const fadeOut = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

const toastSlideIn = keyframes({
  from: { transform: 'translateX(calc(100% + $space$8))' },
  to: { transform: 'translateX(0)' },
});

const toastSwipeOut = keyframes({
  from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
  to: { transform: 'translateX(calc(100% + $space$8))' },
});

const slideIn = keyframes({
  '0%': { transform: 'translateY(100%)' },
  '100%': { transform: 'translateY(0)' },
});

const slideOut = keyframes({
  '0%': { transform: 'translateY(0)' },
  '100%': { transform: 'translateY(100%)' },
});

export { fadeIn, fadeOut, toastSlideIn, toastSwipeOut, slideIn, slideOut };
