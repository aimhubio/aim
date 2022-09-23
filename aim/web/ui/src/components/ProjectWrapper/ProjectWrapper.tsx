import React from 'react';

import projectsModel from 'services/models/projects/projectsModel';

const projectDataRequestRef = projectsModel.getProjectsData();
projectDataRequestRef.call();
const pinnedSequencesRequestRef = projectsModel.getPinnedSequences();
pinnedSequencesRequestRef.call();

function ProjectWrapper() {
  React.useEffect(() => {
    return () => {
      projectDataRequestRef.abort();
      pinnedSequencesRequestRef.abort();
    };
  }, []);

  return null;
}

export default ProjectWrapper;
