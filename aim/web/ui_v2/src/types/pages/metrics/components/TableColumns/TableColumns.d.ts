import React from 'react';

export interface ITableColumn {
  key: string;
  content: React.ReactNode;
  topHeader: string;
  pin?: string;
}
