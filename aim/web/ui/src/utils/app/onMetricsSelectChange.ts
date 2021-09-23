import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { IModel, State } from 'types/services/models/model';

export default function onMetricsSelectChange<
  M extends State,
  D extends Partial<ISelectMetricsOption[]>,
>(data: D, model: IModel<M>) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: { ...configData.select, metrics: data },
      },
    });
  }
}
