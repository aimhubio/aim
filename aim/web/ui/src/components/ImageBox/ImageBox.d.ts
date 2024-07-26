import { IBlobURISystemEngine } from 'modules/core/engine/blob-uri-system';

export interface ImageBoxProps {
  engine: {
    blobURI: IBlobURISystemEngine['engine'];
  };
  caption?: string;
  blobData: string;
  step: number;
  index: number;
  context: Record<string, any>;
  format: string;
  name: string;
  style?: {};
  isFullView?: boolean;
}
