import React from 'react';

import useModel from 'hooks/model/useModel';

import projectsModel from 'services/models/projects/projectsModel';

import { IProjectsModelState } from 'types/services/models/projects/projectsModel';

const projectDataRequestRef = projectsModel.getProjectsData();
projectDataRequestRef.call();

function ProjectWrapper() {
  const projectsData = useModel<IProjectsModelState>(projectsModel);

  React.useEffect(() => {
    return () => {
      projectDataRequestRef.abort();
    };
  }, [projectsData]);

  return null;
}

export default ProjectWrapper;
