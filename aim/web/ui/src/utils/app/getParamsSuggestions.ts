import { IProjectsModelState } from 'types/services/models/projects/projectsModel';

/**
 * @returns memoized params suggestions from projectsData
 */

export function getParamsSuggestions(data: IProjectsModelState) {
  let list: string[] = [];
  if (data?.params) {
    Object.keys(data?.params).forEach((option: any) => {
      if (option) {
        list.push(`run.${option}`);
        if (data.params) {
          if (data?.params[option]) {
            Object.keys(data?.params[option]).forEach((subOption) => {
              list.push(`run.${option}.${subOption}`);
            });
          }
        }
      }
    });
  }
  return list;
}
