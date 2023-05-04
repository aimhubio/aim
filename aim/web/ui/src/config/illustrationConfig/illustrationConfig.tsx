import emptyBookmarks from 'assets/illustrations/emptyBookmarks.svg';
import emptySearch from 'assets/illustrations/emptySearch.svg';
import exploreData from 'assets/illustrations/exploreData.svg';
import wrongSearch from 'assets/illustrations/wrongSearch.svg';

import { DOCUMENTATIONS } from 'config/references';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { PipelineStatusEnum } from 'modules/core/engine/types';

enum IllustrationsEnum {
  EmptyBookmarks = 'emptyBookmarks',
  EmptySearch = 'emptySearch',
  ExploreData = 'exploreData',
  WrongSearch = 'wrongSearch',
  EmptyData = 'emptyData',
}

const Illustrations_List: { [key: string]: string } = {
  [IllustrationsEnum.EmptyBookmarks]: emptyBookmarks,
  [IllustrationsEnum.EmptySearch]: emptySearch,
  [IllustrationsEnum.ExploreData]: exploreData,
  [IllustrationsEnum.WrongSearch]: wrongSearch,
  [IllustrationsEnum.EmptyData]: exploreData,
  // for base explorer statuses
  [PipelineStatusEnum.Never_Executed]: exploreData,
  [PipelineStatusEnum.Insufficient_Resources]: exploreData,
  [PipelineStatusEnum.Empty]: emptySearch,
  [PipelineStatusEnum.Failed]: wrongSearch,
};

const Request_Illustrations = {
  [RequestStatusEnum.BadRequest]: IllustrationsEnum.WrongSearch,
  [RequestStatusEnum.NotRequested]: IllustrationsEnum.ExploreData,
  [RequestStatusEnum.Ok]: IllustrationsEnum.EmptySearch,
  [RequestStatusEnum.Pending]: IllustrationsEnum.ExploreData,
};
const Illustration_Title_Config: { [key: string]: object | any } = {
  runs: {
    [IllustrationsEnum.WrongSearch]: 'Incorrect Query',
    [IllustrationsEnum.EmptySearch]: 'No Results',
    [IllustrationsEnum.ExploreData]: (
      <>
        It’s super easy to search Aim experiments. Just start typing your query
        in the search bar above.
        <br />
        Look up
        <a
          className='qlAnchor'
          href={DOCUMENTATIONS.EXPLORERS.RUNS.SEARCH}
          target='_blank'
          rel='noreferrer'
        >
          search docs
        </a>
        to learn more.
      </>
    ),
    [IllustrationsEnum.EmptyData]: <span>You don't have any tracked runs</span>,
  },
  metrics: {
    [IllustrationsEnum.WrongSearch]: 'Incorrect Query',
    [IllustrationsEnum.EmptySearch]: 'No Results',
    [IllustrationsEnum.ExploreData]: (
      <>
        It’s super easy to search Aim experiments. Just start typing your query
        in the search bar above.
        <br />
        Look up
        <a
          className='qlAnchor'
          href={DOCUMENTATIONS.EXPLORERS.METRICS.SEARCH}
          target='_blank'
          rel='noreferrer'
        >
          search docs
        </a>
        to learn more.
      </>
    ),
    [IllustrationsEnum.EmptyData]: (
      <span>You don't have any tracked metrics</span>
    ),
  },
  params: {
    [IllustrationsEnum.WrongSearch]: 'Incorrect Query',
    [IllustrationsEnum.EmptySearch]: 'No Results',
    [IllustrationsEnum.ExploreData]: (
      <>
        It’s super easy to search Aim experiments. Just start typing your query
        in the search bar above.
        <br />
        Look up
        <a
          className='qlAnchor'
          href={DOCUMENTATIONS.EXPLORERS.PARAMS.SEARCH}
          target='_blank'
          rel='noreferrer'
        >
          search docs
        </a>
        to learn more.
      </>
    ),
    [IllustrationsEnum.EmptyData]: <span>You don't have any tracked runs</span>,
  },
  image: {
    [IllustrationsEnum.WrongSearch]: 'Incorrect Query',
    [IllustrationsEnum.EmptySearch]: 'No Results',
    [IllustrationsEnum.ExploreData]: (
      <>
        It’s super easy to search Aim experiments. Just start typing your query
        in the search bar above.
        <br />
        Look up
        <a
          className='qlAnchor'
          href={DOCUMENTATIONS.EXPLORERS.IMAGES.SEARCH}
          target='_blank'
          rel='noreferrer'
        >
          search docs
        </a>
        to learn more.
      </>
    ),
    [IllustrationsEnum.EmptyData]: (
      <span>You don't have any tracked images</span>
    ),
  },
  figures: {
    [PipelineStatusEnum.Never_Executed]: (
      <>
        It’s super easy to search Aim experiments. Just start typing your query
        in the search bar above.
        <br />
        Look up
        <a
          className='qlAnchor'
          href={DOCUMENTATIONS.EXPLORERS.SEARCH}
          target='_blank'
          rel='noreferrer'
        >
          search docs
        </a>
        to learn more.
      </>
    ),
    [PipelineStatusEnum.Failed]: 'Incorrect Query',
    [PipelineStatusEnum.Insufficient_Resources]: (
      <span>You don't have any tracked figures</span>
    ),
    [PipelineStatusEnum.Empty]: 'No Results',
  },
  scatters: {
    [IllustrationsEnum.WrongSearch]: 'Incorrect Query',
    [IllustrationsEnum.EmptySearch]: 'No Results',
    [IllustrationsEnum.ExploreData]: (
      <>
        It’s super easy to search Aim experiments. Just start typing your query
        in the search bar above.
        <br />
        Look up
        <a
          className='qlAnchor'
          href={DOCUMENTATIONS.EXPLORERS.SCATTERS.SEARCH}
          target='_blank'
          rel='noreferrer'
        >
          search docs
        </a>
        to learn more.
      </>
    ),
    [IllustrationsEnum.EmptyData]: <span>You don't have any tracked runs</span>,
  },
  bookmarks: {
    [IllustrationsEnum.EmptyData]: 'No Bookmarks Yet',
  },
  tags: {
    [IllustrationsEnum.EmptySearch]: 'No Results',
    [IllustrationsEnum.ExploreData]: <span>You don't have any tags</span>,
  },
};

const Illustration_Content_Config: { [key: string]: object | any } = {
  runs: {
    [IllustrationsEnum.EmptyData]: '',
  },
  metrics: {
    [IllustrationsEnum.EmptyData]: '',
    //     (
    //     <CodeBlock
    //       code={`run_inst = aim.Run(experiment='my_exp_name')
    //
    // # Save inputs, hparams or any other \`key: value\` pairs
    // run_inst['hparams'] = {
    //     'learning_rate': 0.01,
    //     'batch_size': 32,
    // }
    //
    // # Track metrics
    // for step in range(10):
    //     run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
    // `}
    //     />
    //   ),
  },
  params: {
    [IllustrationsEnum.EmptyData]: '',
    //       (
    //       <CodeBlock
    //         code={`run_inst = aim.Run(experiment='my_exp_name')
    //
    // # Save inputs, hparams or any other \`key: value\` pairs
    // run_inst['hparams'] = {
    //     'learning_rate': 0.01,
    //     'batch_size': 32,
    // }
    //
    // # Track metrics
    // for step in range(10):
    //     run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
    // `}
    //       />
    //     ),
  },
  image: {
    [IllustrationsEnum.EmptyData]: '',
    //       (
    //       <CodeBlock
    //         code={`run_inst = aim.Run(experiment='my_exp_name')
    //
    // # Save inputs, hparams or any other \`key: value\` pairs
    // run_inst['hparams'] = {
    //     'learning_rate': 0.01,
    //     'batch_size': 32,
    // }
    //
    // # Track metrics
    // for step in range(10):
    //     run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
    // `}
    //       />
    //     ),
  },
  scatters: {
    [IllustrationsEnum.EmptyData]: '',
    //       (
    //       <CodeBlock
    //         code={`run_inst = aim.Run(experiment='my_exp_name')
    //
    // # Save inputs, hparams or any other \`key: value\` pairs
    // run_inst['hparams'] = {
    //     'learning_rate': 0.01,
    //     'batch_size': 32,
    // }
    //
    // # Track metrics
    // for step in range(10):
    //     run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
    // `}
    //       />
    //     ),
  },
  figures: {
    [PipelineStatusEnum.Insufficient_Resources]: '',
  },
  bookmarks: {},
  tags: {},
};

export {
  IllustrationsEnum,
  Illustrations_List,
  Illustration_Content_Config,
  Illustration_Title_Config,
  Request_Illustrations,
};
