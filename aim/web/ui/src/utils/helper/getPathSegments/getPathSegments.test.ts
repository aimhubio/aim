import { toEqual } from 'tests/utils';

import getPathSegments from './getPathSegments';

describe('[getPathSegments]', () => {
  it('should return object type', () => {
    const pathSegments = getPathSegments('run.creation_time');
    toEqual('object', typeof pathSegments);
  });

  it('should equal to', () => {
    const pathSegments = getPathSegments('objectWrapper.run.creation_time');
    toEqual(['objectWrapper', 'run', 'creation_time'], pathSegments);
  });

  it('should equal to', () => {
    const pathSegments = getPathSegments('');
    toEqual([], pathSegments);
  });

  it('should equal to', () => {
    const pathSegments = getPathSegments(false as any);
    toEqual([], pathSegments);
  });
});
