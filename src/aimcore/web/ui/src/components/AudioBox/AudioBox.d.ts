import { IEventSystemEngine } from 'modules/core/engine/event-system';
import { IBlobURISystemEngine } from 'modules/core/engine/blob-uri-system';

export interface AudioBoxProps {
  engine: {
    events: IEventSystemEngine['engine'];
    blobURI: IBlobURISystemEngine['engine'];
  };
  isFullView?: boolean;
  caption?: string;
  blobData: string;
  step: number;
  index: number;
  context: Record<string, any>;
  format: string;
  name: string;
  style?: {};
}
