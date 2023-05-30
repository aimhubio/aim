/**
 * Defined sequence types
 */
export enum SequenceType {
  Metric = 'asp.Metric',
  Text = 'asp.TextSequence',
  Image = 'asp.ImageSequence',
  Audio = 'asp.AudioSequence',
  Distribution = 'asp.DistributionSequence',
  Figure = 'asp.FigureSequence',
  Figure3d = 'asp.Figure3DSequence',
}

const SequenceNameDict = {
  [SequenceType.Metric]: 'metric',
  [SequenceType.Text]: 'text',
  [SequenceType.Image]: 'image',
  [SequenceType.Audio]: 'audio',
  [SequenceType.Distribution]: 'distribution',
  [SequenceType.Figure]: 'figure',
  [SequenceType.Figure3d]: 'figure3d',
};

export const GetSequenceName = (type: SequenceType) => SequenceNameDict[type];

export enum ContainerType {
  Run = 'asp.Run',
}

/**
 * Sequence types as union type
 */
export type SequenceTypeUnion = `${SequenceType}`;

/**
 * Depths of data coming from api, from which level should get the actual value of visualization data
 */
export enum AimObjectDepths {
  Container = 0,
  Sequence = 1,
  Step = 2,
  Index = 3,
}
