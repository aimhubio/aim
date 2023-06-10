import * as dot from 'dot-object';

function getAdvancedSuggestion(data: Record<any, any>): Record<any, any> {
  let obj = {};
  let contextKeys: Record<any, any> = {};
  Object.keys(data).forEach((key: string) => {
    data[key]?.forEach((element: any) => {
      obj = { ...obj, ...dot.dot(element) };
    });
  });
  Object.keys(obj).forEach((key) => {
    contextKeys[key] = '';
  });
  return dot.object(contextKeys);
}

export default getAdvancedSuggestion;
