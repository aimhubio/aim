import { CSSProperties } from 'react';

export interface IDictVisualizerProps {
  src: object | { [key: string]: unknown };
  style?: CSSProperties;
}

export type DictVisualizerRow = {
  id: string;
  root?: boolean;
  level: number;
  key: string | number | null;
  value: unknown;
  sub: string | null;
  color: string;
};
