import { CSSProperties } from 'react';

export interface IDictVisualizerProps {
  src: object | Record<string, unknown>;
  style?: CSSProperties;
  autoScale?: boolean;
}

export type DictVisualizerRowType = {
  id: string;
  root?: boolean;
  closing?: boolean;
  level: number;
  key: string | number | null;
  value: unknown;
  closedValue?: unknown;
  sub: string | null;
  color: string;
  copyContent?: string;
};

export interface IDictVisualizerRowProps {
  row: DictVisualizerRowType;
  collapseToggler: (rowID: string) => void;
  style?: CSSProperties;
  index: number;
  isCollapsed: boolean;
  rowsCount: number;
}
