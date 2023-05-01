/**
 * Defined sequence names
 */
export enum SequenceTypesEnum {
  Distributions = 'distributions',
  Figures = 'figures',
  Images = 'images',
  Audios = 'audios',
  Metric = 'metric',
  Texts = 'texts',
}

/**
 * Depths of data coming from api, from which level should get the actual value of visualization data
 */
export enum AimObjectDepths {
  Container = 0,
  Sequence = 1,
  Step = 2,
  Index = 3,
}

/**
 * Sequence names as union type
 */
export type SequenceTypesUnion = `${SequenceTypesEnum}`;
