import { IBlobURISystemEngine } from 'modules/core/engine/blob-uri-system';

export interface FigureBoxProps {
  engine: {
    blobURI: IBlobURISystemEngine['engine'];
  };
  isFullView?: boolean;
  blobData: string;
  step: number;
  context: Record<string, any>;
  format: string;
  name: string;
  style?: {};
}
