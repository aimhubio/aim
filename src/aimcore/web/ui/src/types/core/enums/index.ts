/**
 * Defined sequence types
 */
export enum SequenceType {
  Metric = 'base.Metric',
  Text = 'base.TextSequence',
  Image = 'base.ImageSequence',
  Audio = 'base.AudioSequence',
  Distribution = 'base.DistributionSequence',
  Figure = 'base.FigureSequence',
  Figure3d = 'base.Figure3DSequence',
  // add new sequence type here
}
/**
 * SequenceNameDict is used to get sequence name from SequenceType
 * SequenceName is used in UI to exclude 'base.' from SequenceType
 *
 * Not recommended to change SequenceNameDict values, they are used as default values for groupings and will be saved in URL
 * Add corresponding sequence name (SequenceNameDict property) if you will add a new sequence type (SequenceType)
 */
const SequenceNameDict: Record<SequenceType, string> = {
  [SequenceType.Metric]: 'metric',
  [SequenceType.Text]: 'text',
  [SequenceType.Image]: 'image',
  [SequenceType.Audio]: 'audio',
  [SequenceType.Distribution]: 'distribution',
  [SequenceType.Figure]: 'figure',
  [SequenceType.Figure3d]: 'figure3d',
  // add new sequence name here
};

export const GetSequenceName = (type: SequenceType) => SequenceNameDict[type];

export enum ContainerType {
  Run = 'base.Run',
  // add new container type here
}

const ContainerNameDict: Record<ContainerType, string> = {
  [ContainerType.Run]: 'run',
  // add new container name here
};

export const GetContainerName = (type: ContainerType) =>
  ContainerNameDict[type];

/**
 * Sequence types as union type
 */
export type SequenceTypeUnion = `${SequenceType}`;
