import React from 'react';

import projectsModel from 'services/models/projects/projectsModel';

const projectDataRequestRef = projectsModel.getProjectsData();
projectDataRequestRef.call();

function ProjectWrapper() {
  React.useEffect(() => {
    return () => {
      projectDataRequestRef.abort();
    };
  }, []);

  return null;
}

export default ProjectWrapper;
