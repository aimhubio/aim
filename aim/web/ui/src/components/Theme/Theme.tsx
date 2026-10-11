import React from 'react';

import {
  unstable_createMuiStrictModeTheme as createMuiTheme,
  ThemeOptions,
  ThemeProvider,
  StylesProvider,
} from '@material-ui/core';

import { IThemeContextValues, IThemeProps } from 'types/components/Theme/Theme';

export const ThemeContext = React.createContext<IThemeContextValues>({
  dark: false,
  handleTheme: () => {},
});
const { Provider } = ThemeContext;

export const THEME_STORAGE_KEY = 'aim-ui-theme';

function getInitialDarkMode(): boolean {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
  } catch {
    // Storage can be unavailable in embedded or restricted browser contexts.
    return false;
  }
}

const light: ThemeOptions = {
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  overrides: {
    MuiDivider: {
      root: {
        backgroundColor: '#E8F1FC',
      },
    },
    MuiButton: {
      root: {
        height: 32,
        boxShadow: 'unset',
      },
      contained: {
        boxShadow: 'unset',
      },
    },
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette: {
    type: 'light',
    primary: {
      main: '#1473E6',
    },
    secondary: {
      main: '#1c2852',
    },
    text: {
      primary: '#414B6D',
    },
  },
  spacing: (factor: number) => `${factor}em`,
};

const darkTheme: ThemeOptions = {
  ...light,
  overrides: {
    ...light.overrides,
    MuiDivider: {
      root: {
        backgroundColor: '#39445C',
      },
    },
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#64b5f6',
    },
    secondary: {
      main: '#B5C7EF',
    },
    background: {
      default: '#151A26',
      paper: '#202838',
    },
    text: {
      primary: '#E5EAF3',
      secondary: '#B2BDD1',
    },
    divider: '#39445C',
  },
};

function Theme(
  props: IThemeProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [dark, setDark] = React.useState<boolean>(getInitialDarkMode);

  React.useLayoutEffect(() => {
    // Put the theme on the document so dialogs and popovers in portals inherit it.
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-aim-theme');
    root.setAttribute('data-aim-theme', dark ? 'dark' : 'light');
    return () => {
      if (previousTheme === null) {
        root.removeAttribute('data-aim-theme');
      } else {
        root.setAttribute('data-aim-theme', previousTheme);
      }
    };
  }, [dark]);

  React.useEffect(() => {
    function syncTheme(event: StorageEvent) {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setDark(getInitialDarkMode());
      }
    }
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  const handleTheme = React.useCallback((): void => {
    const nextDark = !dark;
    setDark(nextDark);
    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextDark ? 'dark' : 'light',
      );
    } catch {
      // Keep the toggle usable even when saving the preference is blocked.
    }
  }, [dark]);

  const theme = React.useMemo(
    () => createMuiTheme(dark ? darkTheme : light),
    [dark],
  );
  const context = React.useMemo(
    () => ({ dark, handleTheme }),
    [dark, handleTheme],
  );
  return (
    <Provider value={context}>
      <ThemeProvider theme={theme}>
        <StylesProvider injectFirst={true}>{props.children}</StylesProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default Theme;
