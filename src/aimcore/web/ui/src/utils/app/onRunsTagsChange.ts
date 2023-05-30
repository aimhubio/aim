import { ITagInfo } from 'types/pages/tags/Tags';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';
import { IModel, State } from 'types/services/models/model';

export default function onRunsTagsChange<M extends State>({
  tags,
  runHash,
  model,
  updateModelData,
}: {
  tags: ITagInfo[];
  runHash: string;
  model: IModel<M>;
  updateModelData: (
    configData?: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}) {
  const data = model.getState()?.rawData;
  const resultData = data?.map((item: any) => {
    if (item.hash === runHash) {
      return {
        ...item,
        props: {
          ...item.props,
          tags,
        },
      };
    }
    return item;
  });
  model.setState({ rawData: resultData });
  updateModelData();
}
