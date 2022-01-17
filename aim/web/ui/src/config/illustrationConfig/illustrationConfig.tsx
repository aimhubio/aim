import emptyBookmarks from 'assets/illustrations/emptyBookmarks.svg';
import emptySearch from 'assets/illustrations/emptySearch.svg';
import exploreData from 'assets/illustrations/exploreData.svg';
import wrongSearch from 'assets/illustrations/wrongSearch.svg';

import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Text } from 'components/kit';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

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
};

const Request_Illustrations = {
  [RequestStatusEnum.BadRequest]: IllustrationsEnum.WrongSearch,
  [RequestStatusEnum.NotRequested]: IllustrationsEnum.ExploreData,
  [RequestStatusEnum.Ok]: IllustrationsEnum.EmptySearch,
  [RequestStatusEnum.Pending]: IllustrationsEnum.ExploreData,
};
const Illustration_Title_Config: { [key: string]: object | any } = {
  runs: {
    [IllustrationsEnum.WrongSearch]: '',
    [IllustrationsEnum.EmptyData]: '',
  },
  metrics: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'No Results Found',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: (
      <span>
        You don’t have any tacked metrics. <br /> Use this code for track your
        training runs
      </span>
    ),
  },
  params: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'No Results Found',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: (
      <span>
        You don’t have any tacked metrics. <br /> Use this code for track your
        training runs
      </span>
    ),
  },
  image: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'Empty Search',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: (
      <span>
        You don’t have any tacked metrics. <br /> Use this code for track your
        training runs
      </span>
    ),
  },
  scatters: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'Empty Search',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: (
      <span>
        You don’t have any tacked metrics. <br /> Use this code for track your
        training runs
      </span>
    ),
  },
  bookmarks: {
    [IllustrationsEnum.ExploreData]: 'No Bookmarks Yet',
  },
  tags: {},
};

const Illustration_Content_Config: { [key: string]: object | any } = {
  runs: {
    [IllustrationsEnum.EmptyData]: '',
  },
  metrics: {
    [IllustrationsEnum.EmptyData]: (
      <CodeBlock
        code={`run_inst = aim.Run(experiment='my_exp_name')

# Save inputs, hparams or any other \`key: value\` pairs
run_inst['hparams'] = {
    'learning_rate': 0.01,
    'batch_size': 32,
}

# Track metrics
for step in range(10):
    run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
`}
      />
    ),
  },
  params: {
    [IllustrationsEnum.EmptyData]: (
      <CodeBlock
        code={`run_inst = aim.Run(experiment='my_exp_name')

# Save inputs, hparams or any other \`key: value\` pairs
run_inst['hparams'] = {
    'learning_rate': 0.01,
    'batch_size': 32,
}

# Track metrics
for step in range(10):
    run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
`}
      />
    ),
  },
  image: {
    [IllustrationsEnum.EmptyData]: (
      <CodeBlock
        code={`run_inst = aim.Run(experiment='my_exp_name')

# Save inputs, hparams or any other \`key: value\` pairs
run_inst['hparams'] = {
    'learning_rate': 0.01,
    'batch_size': 32,
}

# Track metrics
for step in range(10):
    run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
`}
      />
    ),
  },
  scatters: {
    [IllustrationsEnum.EmptyData]: (
      <CodeBlock
        code={`run_inst = aim.Run(experiment='my_exp_name')

# Save inputs, hparams or any other \`key: value\` pairs
run_inst['hparams'] = {
    'learning_rate': 0.01,
    'batch_size': 32,
}

# Track metrics
for step in range(10):
    run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
`}
      />
    ),
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
