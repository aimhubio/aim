import React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from '@material-ui/core';

import Theme, { THEME_STORAGE_KEY } from './Theme';
import ThemeToggle from './ThemeToggle';

function PaletteProbe() {
  const theme = useTheme();
  return (
    <output data-testid='palette'>
      {JSON.stringify({
        type: theme.palette.type,
        fontFamily: theme.typography.fontFamily,
        spacing: theme.spacing(2),
        buttonHeight: theme.overrides?.MuiButton?.root,
      })}
    </output>
  );
}

function renderTheme() {
  return render(
    <Theme>
      <ThemeToggle />
      <PaletteProbe />
    </Theme>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('defaults to light mode without writing a preference', () => {
  renderTheme();
  expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'light');
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
});

test('toggles both ways and restores the saved mode after remounting', () => {
  const { unmount } = renderTheme();
  fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'dark');
  unmount();
  expect(document.documentElement).not.toHaveAttribute('data-aim-theme');

  renderTheme();
  expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'light');
});

test('preserves Aim typography, spacing and button sizing in dark mode', () => {
  const { unmount } = renderTheme();
  const light = JSON.parse(screen.getByTestId('palette').textContent!);
  unmount();
  localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  renderTheme();
  const dark = JSON.parse(screen.getByTestId('palette').textContent!);
  expect(dark).toEqual({ ...light, type: 'dark' });
});

test('ignores invalid preferences', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'invalid');
  renderTheme();
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'light');
});

test('remains usable when browser storage is blocked', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage blocked');
  });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage blocked');
  });
  renderTheme();
  fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'dark');
  fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'light');
});

test('follows preference changes and clearing storage in another tab', () => {
  renderTheme();
  act(() => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    window.dispatchEvent(
      new StorageEvent('storage', { key: THEME_STORAGE_KEY }),
    );
  });
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'dark');
  act(() => {
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });
  expect(document.documentElement).toHaveAttribute('data-aim-theme', 'light');
});
