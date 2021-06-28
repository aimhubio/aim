import React from 'react';
import {
  IErrorBoundaryProps,
  IErrorBoundaryState,
} from 'types/components/ErrorBoundary/ErrorBoundary';

class ErrorBoundary extends React.Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  private _fallback: React.FunctionComponent;

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
    };

    this._fallback = () => props.fallback ?? <h1>Something went wrong.</h1>;
  }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to reporting servie
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return <this._fallback />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
