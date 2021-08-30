import React, { memo } from 'react';
import moment from 'moment';
import { NavLink } from 'react-router-dom';

import tagDetailAppModel from 'services/models/tags/tagDetailAppModel';
import { ITagRun, ITagRunsProps } from 'types/pages/tags/Tags';
import './Tags.scss';

function TagRuns({
  tagHash,
  tagRuns,
}: ITagRunsProps): React.FunctionComponentElement<React.ReactNode> {
  React.useEffect(() => {
    tagDetailAppModel.initialize();
    const tagRunsRequestRef = tagDetailAppModel.getTagRuns(tagHash);
    tagRunsRequestRef.call();
    return () => {
      tagRunsRequestRef.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {tagRuns ? (
        tagRuns?.map((tagRun: ITagRun) => (
          <div key={tagRun.run_id}>
            <NavLink to={`/runs/${tagRun.run_id}`}>{`${
              tagRun.experiment ?? 'Default'
            }/${tagRun.run_id}`}</NavLink>
            <p>
              Created at{' '}
              {moment(tagRun.creation_time).format('HH:mm · D MMM, YY')}
            </p>
          </div>
        ))
      ) : (
        <p>saasd</p>
      )}
    </div>
  );
}

export default memo(TagRuns);
