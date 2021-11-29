import React from 'react';

import useModel from 'hooks/model/useModel';

import projectsModel from 'services/models/projects/projectsModel';

import { IProjectsModelState } from 'types/services/models/projects/projectsModel';

/**
 * @returns memoized params suggestions from projectsData
 */
function useParamsSuggestions() {
  const projectsData = useModel<IProjectsModelState>(projectsModel);

  const suggestions = React.useMemo(() => {
    let list: string[] = [];
    if (projectsData?.params) {
      Object.keys(projectsData?.params).forEach((option: any) => {
        if (option) {
          list.push(`run.${option}`);
          if (projectsData.params) {
            if (projectsData?.params[option]) {
              Object.keys(projectsData?.params[option]).forEach((subOption) => {
                list.push(`run.${option}.${subOption}`);
              });
            }
          }
        }
      });
    }
    return list;
  }, [projectsData?.params]);

  return suggestions;
}

export default useParamsSuggestions;
