import React from 'react';

export interface IErrorBoundaryProps {
  fallback?: React.ReactElement;
}

export interface IErrorBoundaryState {
  error: Error | null;
}
