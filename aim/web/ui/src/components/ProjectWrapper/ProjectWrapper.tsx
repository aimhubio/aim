import React from 'react';
import { useLocation } from 'react-router-dom';

import useModel from 'hooks/model/useModel';

import projectsModel from 'services/models/projects/projectsModel';

import { IProjectsModelState } from 'types/services/models/projects/projectsModel';

import {
  getDocumentTitle,
  setDocumentTitle,
} from 'utils/document/documentTitle';

const projectDataRequestRef = projectsModel.getProjectsData();
projectDataRequestRef.call();

function ProjectWrapper() {
  const projectsData = useModel<IProjectsModelState>(projectsModel);
  const { pathname } = useLocation();

  React.useEffect(() => {
    const { title, withPrefix } = getDocumentTitle(pathname);
    setDocumentTitle(title, withPrefix);
  }, [pathname]);

  React.useEffect(() => {
    return () => {
      projectDataRequestRef.abort();
    };
  }, [projectsData]);

  return null;
}

export default ProjectWrapper;
