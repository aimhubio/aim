import React from 'react';

import projectsModel from '../../services/models/projects/projectsModel';
import useModel from '../../hooks/model/useModel';

const projectDataRequestRef = projectsModel.getProjectsData();

function ProjectWrapper() {
  const projectsData = useModel(projectsModel);

  React.useEffect(() => {
    if (projectsData.path) {
      document.title = `Aim: ${projectsData.path}`;
    }

    return () => {
      projectDataRequestRef.abort();
    };
  }, [projectsData]);

  return null;
}

export default ProjectWrapper;
