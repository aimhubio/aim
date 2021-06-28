import React from 'react';

export interface IThemeProps {
  children: React.ReactNode;
}

export interface IThemeContextValues {
  dark: boolean;
  handleTheme: () => void;
}
