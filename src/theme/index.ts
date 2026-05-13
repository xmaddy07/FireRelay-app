import React from 'react';
import {light} from './light';
import {dark} from './dark';

export const theme = {
  light,
  dark,
};

export const ThemeProvider = ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children);
