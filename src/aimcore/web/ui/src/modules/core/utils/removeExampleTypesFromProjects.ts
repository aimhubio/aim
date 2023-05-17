import { GetParamsResult } from 'modules/core/api/projectApi';

function removeExampleTypesFromProjectData(params: GetParamsResult) {
  for (let paramKey in params) {
    // @ts-ignore
    const param = params[paramKey];
    if (typeof param === 'object') {
      if (param.hasOwnProperty('__example_type__')) {
        // @ts-ignore
        params[paramKey] = true;
      } else {
        removeExampleTypesFromProjectData(param);
      }
    } else {
      // @ts-ignore
      params[paramKey] = true;
    }
  }
  return params;
}

export default removeExampleTypesFromProjectData;
