import React from 'react';

export interface IExportPreviewProps {
  openModal: boolean;
  onToggleExportPreview: () => void;
  withDynamicDimensions?: boolean;
  explorerPage?: 'metrics' | 'scatters';
  children?: React.ReactNode;
  appendElement?: React.ReactNode;
}

export interface IPreviewBounds {
  max: {
    width: number;
    height: number;
  };
  min: {
    width: number;
    height: number;
  };
}
