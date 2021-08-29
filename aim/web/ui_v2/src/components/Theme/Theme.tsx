import React from 'react';
import {
  unstable_createMuiStrictModeTheme as createMuiTheme,
  CssBaseline,
  ThemeOptions,
  ThemeProvider,
} from '@material-ui/core';

import { IThemeProps } from 'types/components/Theme/Theme';
// import useFontSize from 'hooks/fontSize/useFontSize';

export const ThemeContext = React.createContext({});
const { Provider } = ThemeContext;

const light: ThemeOptions = {
  overrides: {
    MuiTextField: {},
    MuiInputBase: {
      input: {
        height: '0.6875em',
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
    text: {
      // secondary: '#fff',
    },
  },
  spacing: (factor: number) => `${factor}em`,
};

const darkTheme: ThemeOptions = {
  palette: {
    type: 'dark',
    primary: {
      main: '#64b5f6',
    },
    text: {
      // secondary: '#000',
    },
  },
};

function Theme(
  props: IThemeProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [dark, setDark] = React.useState<boolean>(false);
  // const fontSize = useFontSize();
  //
  // React.useEffect(() => {
  //   document.getElementsByTagName('html')[0].style.fontSize = fontSize + 'px';
  // }, [fontSize]);

  const handleTheme = React.useCallback((): void => {
    setDark(!dark);
  }, [dark]);

  const theme = createMuiTheme(dark ? darkTheme : light);
  return (
    <Provider value={{ dark, handleTheme }}>
      {/* <CssBaseline /> */}
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </Provider>
  );
}

export default Theme;
